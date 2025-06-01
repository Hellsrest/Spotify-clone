import random
from pymongo import MongoClient
from bson.objectid import ObjectId 
import os 

MONGO_URI_DEFAULT = "mongodb://localhost:27017/"
DB_NAME_RECOMMENDER_DEFAULT = "music-app" 
DB_NAME_APP_DATA_DEFAULT = "music-app"





class EpsilonGreedyMongoRecommender:
    """Implements the Epsilon-Greedy algorithm using MongoDB for data persistence.

    Attributes:
        mongo_uri (str): MongoDB connection URI.
        db_name (str): Name of the MongoDB database for recommender state and music items.
        client (MongoClient): PyMongo client instance.
        db (Database): PyMongo database instance.
        musics_collection_name (str): Name of the collection storing music items.
        states_collection_name (str): Name of the collection storing Epsilon-Greedy states for songs.
        epsilon (float): The probability of choosing a random action (exploration).

        item_ids (list): A list of unique ObjectId identifiers for the music items (arms).
        item_values (dict): A dictionary mapping item ObjectIds to their estimated value (average reward).
        item_counts (dict): A dictionary mapping item ObjectIds to the number of times they have been recommended.
    """
    def __init__(self, mongo_uri=None, db_name=None, 
                 musics_collection_name="musics", 
                 states_collection_name="epsilon_greedy_song_states", 
                 epsilon=0.1):
        self.mongo_uri = mongo_uri or os.getenv("MONGO_URI", MONGO_URI_DEFAULT)
        self.db_name = db_name or os.getenv("DB_NAME_RECOMMENDER", DB_NAME_RECOMMENDER_DEFAULT)
        
        self.musics_collection_name = musics_collection_name
        self.states_collection_name = states_collection_name
        self.epsilon = epsilon

        if not 0.0 <= self.epsilon <= 1.0:
            raise ValueError("Epsilon must be between 0.0 and 1.0.")

        try:
            self.client = MongoClient(self.mongo_uri)
            self.db = self.client[self.db_name]
            self.client.admin.command("ping") 
        except Exception as e:
            raise ConnectionError(f"Failed to connect to MongoDB at {self.mongo_uri} for database {self.db_name}: {e}")

        self.item_ids = []
        self.item_values = {}
        self.item_counts = {}
        self._load_items_and_state()

    def _load_items_and_state(self):
        try:
            music_docs = list(self.db[self.musics_collection_name].find({}, {"_id": 1}))
        except Exception as e:
            print(f"Error fetching music items from MongoDB ({self.db_name}.{self.musics_collection_name}): {e}")
            self.item_ids = []
            self.item_values = {}
            self.item_counts = {}
            return

        if not music_docs:
            print(f"Warning: No music items found in collection ")
            print(f"'{self.db_name}.{self.musics_collection_name}'. Recommender will be empty.")
            self.item_ids = []
            return

        self.item_ids = [doc["_id"] for doc in music_docs]
        self.item_values = {item_id: 0.0 for item_id in self.item_ids}
        self.item_counts = {item_id: 0 for item_id in self.item_ids}

        for item_id in self.item_ids:
            state_doc = self.db[self.states_collection_name].find_one({"song_id": item_id})
            if state_doc:
                self.item_values[item_id] = state_doc.get("q_value", 0.0)
                self.item_counts[item_id] = state_doc.get("counts", 0)
        print(f"Loaded {len(self.item_ids)} items from '{self.db_name}.{self.musics_collection_name}'. Initial Q-values and counts loaded/initialized from '{self.states_collection_name}'.")

    def recommend(self):
        if not self.item_ids:
            print("No items available to recommend.")
            return None
        if random.random() < self.epsilon:
            return random.choice(self.item_ids)
        else:
            if not self.item_values:
                return random.choice(self.item_ids)
            max_value = -float('inf')
            best_items = []
            for item_id in self.item_ids:
                value = self.item_values.get(item_id, 0.0)
                if value > max_value:
                    max_value = value
                    best_items = [item_id]
                elif value == max_value:
                    best_items.append(item_id)
            if not best_items:
                return random.choice(self.item_ids)
            return random.choice(best_items)

    def update(self, item_id, reward):
        if item_id not in self.item_ids:
            print(f"Warning: item_id {item_id} not in current item_ids. Adding it dynamically.")
            self.item_ids.append(item_id)
            self.item_values[item_id] = 0.0
            self.item_counts[item_id] = 0
        if not isinstance(reward, (int, float)):
             raise ValueError("Reward must be a numerical value.")

        self.item_counts[item_id] += 1
        n = self.item_counts[item_id]
        current_value = self.item_values[item_id]
        new_value = current_value + (1.0 / n) * (reward - current_value)
        self.item_values[item_id] = new_value

        try:
            self.db[self.states_collection_name].update_one(
                {"song_id": item_id},
                {"$set": {"q_value": new_value, "counts": n}},
                upsert=True
            )
        except Exception as e:
            print(f"Error updating MongoDB state for item_id {item_id}: {e}. State updated in memory only.")

    def get_item_stats(self):
        stats = {}
        for item_id in self.item_ids:
            stats[str(item_id)] = {
                "q_value": self.item_values.get(item_id, 0.0),
                "counts": self.item_counts.get(item_id, 0)
            }
        return stats

    def close_connection(self):
        """Closes the MongoDB connection."""
        if self.client:
            self.client.close()
            print(f"MongoDB connection to {self.db_name} closed.")


if __name__ == "__main__":
    MONGO_URI = os.getenv("MONGO_URI", MONGO_URI_DEFAULT)
    # Database for recommender (music items source, recommender's own state storage)
    DB_NAME_REC = os.getenv("DB_NAME_RECOMMENDER", DB_NAME_RECOMMENDER_DEFAULT)
    MUSIC_COLLECTION = "musics" 
    EPSILON_STATE_COLLECTION = "epsilon_greedy_song_states_test" # Test collection for states

    # Database for actual application data (likes)
    DB_NAME_APP = os.getenv("DB_NAME_APP_DATA", DB_NAME_APP_DATA_DEFAULT) # Should be "music-app"
    LIKES_COLLECTION = "likes"

    # --- Optional: Setup initial music data if collection is empty (for testing) ---
    # This connects to the recommender's DB to ensure music items exist.
    try:
        setup_client = MongoClient(MONGO_URI)
        setup_db_rec = setup_client[DB_NAME_REC]
        if setup_db_rec[MUSIC_COLLECTION].count_documents({}) == 0:
            print(f"Music collection '{DB_NAME_REC}.{MUSIC_COLLECTION}' is empty. Populating with sample data for testing...")
            sample_music_data = [
                {"musicname": "Test Song Alpha", "musictitle": "Title Alpha", "musiclocation": "locA", "uploaderid": ObjectId()},
                {"musicname": "Test Song Beta", "musictitle": "Title Beta", "musiclocation": "locB", "uploaderid": ObjectId()},
                {"musicname": "Test Song Gamma", "musictitle": "Title Gamma", "musiclocation": "locC", "uploaderid": ObjectId()},
            ]
            result = setup_db_rec[MUSIC_COLLECTION].insert_many(sample_music_data)
            print(f"Sample music data inserted with IDs: {result.inserted_ids}")
        
        # Also, ensure the 'likes' collection exists in the app database for the simulation
        # This part is just for the simulation to run without erroring if 'likes' collection is missing.
        # In a real app, the 'likes' collection would be managed by the application.
        setup_db_app = setup_client[DB_NAME_APP]
        if LIKES_COLLECTION not in setup_db_app.list_collection_names():
            print(f"Likes collection '{DB_NAME_APP}.{LIKES_COLLECTION}' does not exist. Creating it for simulation purposes.")
            setup_db_app.create_collection(LIKES_COLLECTION)
            # Optionally, insert some dummy likes for testing if music IDs are known
            # For example, if result.inserted_ids from above is available and you want to pre-populate likes:
            # if result and result.inserted_ids:
            #    setup_db_app[LIKES_COLLECTION].insert_one({"song_id": result.inserted_ids[0], "user_id": ObjectId()})

        setup_client.close()
    except Exception as e:
        print(f"Could not connect to MongoDB for setup: {e}. Please ensure MongoDB is running.")
        exit()
    # --- End Optional Setup --- 

    recommender = None
    app_data_client = None
    try:
        recommender = EpsilonGreedyMongoRecommender(
            mongo_uri=MONGO_URI, 
            db_name=DB_NAME_REC,
            musics_collection_name=MUSIC_COLLECTION,
            states_collection_name=EPSILON_STATE_COLLECTION,
            epsilon=0.2 
        )

        if not recommender.item_ids:
            print(f"No music items loaded by recommender from '{DB_NAME_REC}.{MUSIC_COLLECTION}'. Exiting simulation.")
            exit()

        # Client for accessing app data (likes)
        app_data_client = MongoClient(MONGO_URI)
        app_db = app_data_client[DB_NAME_APP]

        print(f"\nRunning Epsilon-Greedy (epsilon={recommender.epsilon}) simulation for 20 recommendations...")
        num_recommendations = 20
        total_actual_likes_based_reward = 0

        for i in range(num_recommendations):
            recommended_item_id = recommender.recommend()
            if recommended_item_id is None:
                print("No item could be recommended.")
                continue

            # Fetch actual likes for the recommended song from the app database
            try:
                num_likes = app_db[LIKES_COLLECTION].count_documents({"song_id": recommended_item_id})
            except Exception as e:
                print(f"Error fetching likes for song {recommended_item_id} from '{DB_NAME_APP}.{LIKES_COLLECTION}': {e}")
                num_likes = 0 # Assume 0 likes if error occurs
            
            actual_reward = num_likes # Using total like count as reward
            
            print(f"Recommendation {i+1}: Recommended Item ID {recommended_item_id}, Found {num_likes} likes (Reward: {actual_reward})")
            recommender.update(recommended_item_id, actual_reward)
            total_actual_likes_based_reward += actual_reward

        print("\nSimulation Complete.")
        print(f"Total Reward Earned (based on like counts): {total_actual_likes_based_reward}")
        print("Final Item Counts and Q-Values (from recommender state):")
        
        final_stats = recommender.get_item_stats()
        for item_id_str, stats_dict in final_stats.items(): 
            print(f"  Item ID: {item_id_str}")
            print(f"    Times Recommended (Count): {stats_dict['counts']}")
            print(f"    Estimated Q-Value: {stats_dict['q_value']:.4f}")

    except ConnectionError as e:
        print(f"Failed during recommender operation: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
    finally:
        if recommender:
            recommender.close_connection()
        if app_data_client:
            app_data_client.close()
            print(f"MongoDB connection to {DB_NAME_APP} (for likes) closed.")


