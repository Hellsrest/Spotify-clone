import mongoose from "mongoose";

const PlaylistSchema = new mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  name: {
    type: String,
    required: true
  },
  playlistcreateddate: {
    type: Date,
    default: Date.now
  },
  songs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Music"
  }]
});

const Playlist = mongoose.model("Playlist", PlaylistSchema);
export default Playlist;