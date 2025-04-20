import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import User from "./Models/Users.js";
import multer from "multer";
import path from "path";
import Music from "./Models/Musics.js";
import Like from "./Models/Likes.js";
import Comment from "./Models/Comments.js";
import Playlist from "./Models/Playlists.js";

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect("mongodb://localhost:27017/music-app")
  .then(() => {
    console.log("MongoDB connected");
    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((err) => console.log(err));

app.post("/login", async (req, res) => {
  const { lemail, lpassword } = req.body;
  try {
    const exeuser = await User.findOne({
      uemail: lemail,
      upassword: lpassword,
    });
    if (!exeuser) {
      console.log("User does not exixst");
      res.status(404).json({ message: "invalid login details" });
    }

    res.status(200).json({
      message: "Login details correct",
      user: exeuser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "user not found" });
  }
});

app.post("/register", async (req, res) => {
  const { uusername, uemail, upassword } = req.body;
  try {
    const newUser = new User({
      uusername,
      uemail,
      upassword,
    });
    const saveduser = await newUser.save();
    console.log(saveduser);
    res
      .status(201)
      .json({ message: "User created successfully", user: saveduser });
  } catch (error) {
    res.status(500).json({ message: "User not created successfully" });
  }
});

//to upload music
app.use("/uploads", express.static("public/uploads"));

//  Set up Multer 
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/"); // Save files in the uploads folder
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext); // Rename file with timestamp
  },
});

const upload = multer({ storage: storage });

app.post("/musicupload", upload.single("tracklocation"), async (req, res) => {
  const { trackname, musictitle, trackuploader } = req.body;
  const tracklocation = req.file ? `/uploads/${req.file.filename}` : "";
  try {
    const umusic = new Music({
      musicname: trackname,
      musictitle: musictitle,
      musiclocation: tracklocation,
      uploaderid: trackuploader,
    });

    // Python script for metadata extraction
    const { exec } = require("child_process");
    const pythonPath = "python"; // Or full path to python.exe
    const scriptPath = "src/python/MusicMetadata.py";

    exec(`${pythonPath} ${scriptPath} "${filepath}" "${savedMusic._id}"`, (error, stdout, stderr) => {
      if (error) console.error(`Python script error: ${error}`);
      if (stderr) console.error(`Python stderr: ${stderr}`);
      console.log(`Python output: ${stdout}`);
    });


    const uploadedmusic = await umusic.save();
    console.log(uploadedmusic);
    if (uploadedmusic) {
      res.status(200).json({ message: "Music uploaded succesfully" });
    }
    res.status(400);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Music not uploaded succesfully" });
  }
});

// to get the music from db along with uploader details
app.get("/activemusic", async (req, res) => {
  try {
    const music = await Music.find().populate("uploaderid", "uusername uemail");
    res.status(200).json(music);
  } catch (error) {
    console.error("Error fetching music data:", error);
    res.status(500).json({ message: "Music not fetched successfully" });
  }
});




//like music
app.post("/likemusic", async (req, res) => {
  const { userid, musicid } = req.body;
  try {
    const likemusic = new Like({
      userid: userid,
      musicid: musicid,
    });

    const likedmusic = await likemusic.save();
    console.log(likedmusic);
    if (likedmusic) {
      res.status(200).json({ message: "Music liked succesfully" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Music Not liked" });
  }
});

// to get the liked music of user from db
app.get("/likedmusic/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(userId);

    // Validate if userId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid User ID" });
    }

    // Find all liked music with music details and uploader details in one query
    const likedMusic = await Like.find({ userid: userId })
      .populate({
        path: "musicid", // Populate the music details
        populate: {
          path: "uploaderid", // Populate uploader details inside musicid
          select: "uusername uemail", // Select only the fields you need
        },
      });

    // If no liked music is found, return an empty array
    if (!likedMusic.length) {
      return res.status(200).json([]);
    }

    // Extract music details from likedMusic (since `Like` schema contains `musicid` reference)
    const musicDetails = likedMusic.map((like) => like.musicid);

    return res.status(200).json(musicDetails);
  } catch (error) {
    console.error("Error fetching liked music:", error);
    return res.status(500).json({ message: "Failed to fetch liked music" });
  }
});


//to update user profile
app.post("/updateuser", async (req, res) => {
  const { id,uusername,uemail, upassword } = req.body;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { uusername, uemail, upassword }, 
      { new: true } 
    );
    res
    .status(201)
    .json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "user not found" });
  }
});

//for comments
// GET endpoint - Fetch all comments for a specific music
app.get("/comments/:musicId", async (req, res) => {
  try {
    const { musicId } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(musicId)) {
      return res.status(400).json({ message: "Invalid music ID format" });
    }

    // Find comments for the specified music and populate user information
    const comments = await Comment.find({ musicid: musicId })
      .populate({
        path: "userid",
        select: "uusername", // Only fetch the username field
        model: User
      })
      .sort({ publishdate: -1 }); // Sort by newest first

    return res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// POST endpoint - Create a new comment
app.post("/comments", async (req, res) => {
  try {
    const { musicid, userid, comment } = req.body;

    // Validate required fields
    if (!musicid || !userid || !comment) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate ObjectId formats
    if (!mongoose.Types.ObjectId.isValid(musicid) || !mongoose.Types.ObjectId.isValid(userid)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // Create new comment
    const newComment = new Comment({
      musicid,
      userid,
      comment,
      publishdate: new Date()
    });

    // Save comment to database
    await newComment.save();

    // Return the newly created comment with the username
    const populatedComment = await Comment.findById(newComment._id).populate({
      path: "userid",
      select: "uusername",
      model: User
    });

    return res.status(201).json(populatedComment);
  } catch (error) {
    console.error("Error creating comment:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// DELETE endpoint - Delete a comment
app.delete("/comments/:commentId", async (req, res) => {
  try {
    const { commentId } = req.params;
    const { userid } = req.body; // To verify the user is the owner of the comment

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: "Invalid comment ID format" });
    }

    // Find the comment
    const comment = await Comment.findById(commentId);

    // Check if comment exists
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Verify that the user is the owner of the comment
    if (comment.userid.toString() !== userid) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    // Delete the comment
    await Comment.findByIdAndDelete(commentId);

    return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// PUT endpoint - Update a comment
app.put("/comments/:commentId", async (req, res) => {
  try {
    const { commentId } = req.params;
    const { userid, comment } = req.body;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: "Invalid comment ID format" });
    }

    // Check if comment exists
    const existingComment = await Comment.findById(commentId);
    if (!existingComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Verify that the user is the owner of the comment
    if (existingComment.userid.toString() !== userid) {
      return res.status(403).json({ message: "Not authorized to update this comment" });
    }

    // Update the comment
    existingComment.comment = comment;
    // Update the publish date to show it was edited (optional)
    // existingComment.publishdate = new Date(); // Uncomment if you want to update timestamp on edit

    // Save the updated comment
    await existingComment.save();

    // Return the updated comment with user details
    const updatedComment = await Comment.findById(commentId).populate({
      path: "userid",
      select: "uusername",
      model: User
    });

    return res.status(200).json(updatedComment);
  } catch (error) {
    console.error("Error updating comment:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

//for playlists
// Create new playlist
app.post("/playlists", async (req, res) => {
  try {
    const { userid, name } = req.body;
    const newPlaylist = new Playlist({
      userid,
      name: name,
      songs: []  // Initialize empty array to match frontend expectation
    });
    const saved = await newPlaylist.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: "Failed to create playlist", details: err.message });
  }
});

// Get all playlists for a user
app.get("/playlists/user/:userid", async (req, res) => {
  try {
    const userId = req.params.userid;
    console.log("Fetching playlists for user:", userId);

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid User ID" });
    }

    // Fetch playlists with populated song data
    const playlists = await Playlist.find({ userid: userId })
      .populate({
        path: "songs",
        populate: {
          path: "uploaderid",
          select: "uusername uemail", // Adjust fields as needed
        }
      });

    if (!playlists.length) {
      return res.status(200).json([]);
    }

    return res.status(200).json(playlists);
  } catch (error) {
    console.error("Error fetching playlists:", error);
    return res.status(500).json({ message: "Failed to fetch playlists", details: error.message });
  }
});

// Delete a playlist
app.delete("/playlists/:playlistId", async (req, res) => {
  try {
    const { userid } = req.body;
    const playlist = await Playlist.findOneAndDelete({ _id: req.params.playlistId, userid });

    if (!playlist) return res.status(404).json({ error: "Playlist not found or not authorized" });

    res.status(200).json({ message: "Playlist deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete playlist", details: err.message });
  }
});

// Edit playlist: change name and order of songs
app.put("/playlists/:playlistId", async (req, res) => {
  try {
    const { userid, name, songs } = req.body;
    const updated = await Playlist.findOneAndUpdate(
      { _id: req.params.playlistId, userid },
      {
        ...(name && { name: name }),
        ...(songs && { songs: songs })
      },
      { new: true }
    ).populate("songs");

    if (!updated) return res.status(404).json({ error: "Playlist not found or not authorized" });

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update playlist", details: err.message });
  }
});

// Add song to playlist
app.post("/playlists/:playlistId/songs", async (req, res) => {
  try {
    const { songId, userid } = req.body;

    const playlist = await Playlist.findOne({ _id: req.params.playlistId, userid });

    if (!playlist) return res.status(404).json({ error: "Playlist not found or not authorized" });

    if (!playlist.songs.includes(songId)) {
      playlist.songs.push(songId);
      await playlist.save();
    }

    res.status(200).json(playlist);
  } catch (err) {
    res.status(500).json({ error: "Failed to add song", details: err.message });
  }
});

// Remove song from playlist
app.delete("/playlists/:playlistId/songs/:songId", async (req, res) => {
  try {
    const { userid } = req.body;
    const playlist = await Playlist.findOne({ _id: req.params.playlistId, userid });

    if (!playlist) return res.status(404).json({ error: "Playlist not found or not authorized" });

    playlist.songs = playlist.songs.filter(
      id => id.toString() !== req.params.songId
    );

    await playlist.save();

    res.status(200).json({ message: "Song removed", playlist });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove song", details: err.message });
  }
});