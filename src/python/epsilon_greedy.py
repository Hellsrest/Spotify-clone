import random

class EpsilonGreedyRecommender:
    """Implements the Epsilon-Greedy algorithm for recommending items (e.g., songs).

    Attributes:
        item_ids (list): A list of unique identifiers for the items (arms).
        item_values (dict): A dictionary mapping item IDs to their estimated value (average reward).
        item_counts (dict): A dictionary mapping item IDs to the number of times they have been recommended.
        epsilon (float): The probability of choosing a random action (exploration).
    """
    def __init__(self, item_ids, epsilon=0.1):
        """Initializes the EpsilonGreedyRecommender.

        Args:
            item_ids (list): A list of unique identifiers for the items to recommend.
            epsilon (float, optional): The exploration probability. Defaults to 0.1.
        """
        if not item_ids:
            raise ValueError("item_ids list cannot be empty.")
        if len(item_ids) != len(set(item_ids)):
            raise ValueError("item_ids must contain unique identifiers.")
        if not 0.0 <= epsilon <= 1.0:
            raise ValueError("Epsilon must be between 0.0 and 1.0.")
            
        self.item_ids = list(item_ids)
        self.item_values = {item_id: 0.0 for item_id in self.item_ids} # Q(a)
        self.item_counts = {item_id: 0 for item_id in self.item_ids} # N(a)
        self.epsilon = epsilon

    def recommend(self):
        """Recommends an item based on the Epsilon-Greedy strategy.

        With probability epsilon, chooses a random item (explore).
        With probability 1-epsilon, chooses the item with the highest estimated value (exploit).

        Returns:
            The ID of the recommended item.
        """
        if random.random() < self.epsilon:
            # Explore: Choose a random item
            return random.choice(self.item_ids)
        else:
            # Exploit: Choose the item with the highest estimated value
            # Find the highest value among all items
            max_value = -float('inf')
            best_items = []
            for item_id in self.item_ids:
                value = self.item_values[item_id]
                if value > max_value:
                    max_value = value
                    best_items = [item_id]
                elif value == max_value:
                    best_items.append(item_id)
            
            # If all values are the same (e.g., initially 0), pick randomly
            if not best_items or len(best_items) == len(self.item_ids):
                 return random.choice(self.item_ids)
            else:
                 # Tie-breaking: Choose randomly among the best items
                 return random.choice(best_items)

    def update(self, item_id, reward):
        """Updates the estimated value and count for the recommended item.

        Args:
            item_id: The ID of the item that was recommended.
            reward (float or int): The reward received (e.g., 1 for like, 0 for no like/skip).
                                   Should be numerical.
        """
        if item_id not in self.item_ids:
            raise ValueError(f"Unknown item_id: {item_id}")
        if not isinstance(reward, (int, float)):
             raise ValueError("Reward must be a numerical value.")

        self.item_counts[item_id] += 1
        n = self.item_counts[item_id]
        current_value = self.item_values[item_id]
        
        # Incremental update formula for the average reward (value)
        # Q_n+1 = Q_n + (1/n) * (R_n+1 - Q_n)
        new_value = current_value + (1.0 / n) * (reward - current_value)
        self.item_values[item_id] = new_value

# Example Usage (for demonstration)
if __name__ == "__main__":
    # Define song IDs
    song_ids = ["song_A", "song_B", "song_C", "song_D"]
    # Assume true probabilities of liking each song (unknown to the algorithm)
    true_probs = {"song_A": 0.2, "song_B": 0.8, "song_C": 0.5, "song_D": 0.6}

    epsilon_value = 0.1 # Exploration probability
    recommender = EpsilonGreedyRecommender(song_ids, epsilon=epsilon_value)

    num_recommendations = 1000
    total_reward = 0

    print(f"Running Epsilon-Greedy (epsilon={epsilon_value}) simulation for {num_recommendations} recommendations...")

    for i in range(num_recommendations):
        recommended_song = recommender.recommend()

        # Simulate user interaction (like or not based on true probability)
        reward = 1 if random.random() < true_probs[recommended_song] else 0

        # Update the recommender
        recommender.update(recommended_song, reward)
        total_reward += reward

        # Optional: Print progress periodically
        # if (i + 1) % 100 == 0:
        #     print(f"Recommendation {i+1}: Recommended {recommended_song}, Reward: {reward}")

    print("\nSimulation Complete.")
    print(f"Total Reward Earned: {total_reward}")
    print("Item Counts:")
    for song_id in recommender.item_ids:
        print(f"  {song_id}: {recommender.item_counts[song_id]} times")
    print("Estimated Average Rewards (Q-values):")
    for song_id in recommender.item_ids:
        print(f"  {song_id}: {recommender.item_values[song_id]:.4f}")

    print(f"\nTrue Probabilities (for comparison): {true_probs}")

