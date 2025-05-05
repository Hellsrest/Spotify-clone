import math
import random

class UCB1Recommender:
    """Implements the UCB1 algorithm for recommending items (e.g., songs).

    Attributes:
        item_ids (list): A list of unique identifiers for the items (arms).
        item_rewards (dict): A dictionary mapping item IDs to their cumulative reward.
        item_counts (dict): A dictionary mapping item IDs to the number of times they have been recommended.
        total_trials (int): The total number of recommendations made so far.
    """
    def __init__(self, item_ids):
        """Initializes the UCB1Recommender.

        Args:
            item_ids (list): A list of unique identifiers for the items to recommend.
        """
        if not item_ids:
            raise ValueError("item_ids list cannot be empty.")
        if len(item_ids) != len(set(item_ids)):
            raise ValueError("item_ids must contain unique identifiers.")
            
        self.item_ids = list(item_ids)
        self.item_rewards = {item_id: 0.0 for item_id in self.item_ids}
        self.item_counts = {item_id: 0 for item_id in self.item_ids}
        self.total_trials = 0

    def recommend(self):
        """Recommends an item based on the UCB1 algorithm.

        Handles the initialization phase (recommending each item once) before
        applying the UCB1 formula.

        Returns:
            The ID of the recommended item.
        """
        # Initialization phase: Play each arm at least once
        for item_id in self.item_ids:
            if self.item_counts[item_id] == 0:
                return item_id

        # UCB1 calculation phase
        ucb_values = {}
        # Ensure total_trials reflects the current decision point (starts from 1 after init)
        # The number of trials 't' in the formula corresponds to the *next* trial number.
        # Since we increment total_trials *after* this calculation in a typical loop,
        # but here we calculate before returning, we use self.total_trials + 1 if needed.
        # However, the reference article uses 't' as the current trial number after init.
        # Let's stick to the article's definition where t starts from 1 after init.
        # total_trials tracks completed recommendations. For the *next* recommendation,
        # the effective 't' in the formula is self.total_trials + 1.
        current_total_trials_for_log = self.total_trials
        if current_total_trials_for_log == 0: # Should not happen after init, but safety check
             current_total_trials_for_log = 1
             
        max_ucb = -1
        best_item_id = None
        potential_items = [] # For tie-breaking

        for item_id in self.item_ids:
            if self.item_counts[item_id] > 0:
                avg_reward = self.item_rewards[item_id] / self.item_counts[item_id]
                # Use max(1, count) in denominator to avoid division by zero if somehow count is 0 after init check
                # Use max(1, total_trials) for log to avoid log(0)
                confidence_bound = math.sqrt((2 * math.log(max(1, current_total_trials_for_log))) / max(1, self.item_counts[item_id]))
                ucb = avg_reward + confidence_bound
                ucb_values[item_id] = ucb

                if ucb > max_ucb:
                    max_ucb = ucb
                    potential_items = [item_id]
                elif ucb == max_ucb:
                    potential_items.append(item_id)
            # else: item_counts[item_id] is 0, handled by init phase

        # Tie-breaking: Choose randomly among the best items
        if potential_items:
             best_item_id = random.choice(potential_items)
        else:
             # Fallback if something went wrong (e.g., no items with count > 0 after init)
             # This case should ideally not be reached if init logic is correct.
             best_item_id = random.choice(self.item_ids)
             
        return best_item_id

    def update(self, item_id, reward):
        """Updates the rewards and counts for the recommended item.

        Args:
            item_id: The ID of the item that was recommended.
            reward (float or int): The reward received (e.g., 1 for like, 0 for no like/skip).
                                   Should be numerical.
        """
        if item_id not in self.item_ids:
            raise ValueError(f"Unknown item_id: {item_id}")
        if not isinstance(reward, (int, float)):
             raise ValueError("Reward must be a numerical value.")

        self.item_rewards[item_id] += reward
        self.item_counts[item_id] += 1
        self.total_trials += 1 # Increment total trials after a successful update

# Example Usage (for demonstration)
if __name__ == "__main__":
    # Define song IDs
    song_ids = ["song_A", "song_B", "song_C", "song_D"]
    # Assume true probabilities of liking each song (unknown to the algorithm)
    true_probs = {"song_A": 0.2, "song_B": 0.8, "song_C": 0.5, "song_D": 0.6}

    recommender = UCB1Recommender(song_ids)

    num_recommendations = 1000
    total_reward = 0

    print(f"Running UCB1 simulation for {num_recommendations} recommendations...")

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
        count = recommender.item_counts[song_id]
        if count > 0:
            avg_reward = recommender.item_rewards[song_id] / count
            print(f"  {song_id}: {avg_reward:.4f}")
        else:
            print(f"  {song_id}: Not recommended yet")

    print(f"\nTrue Probabilities (for comparison): {true_probs}")

