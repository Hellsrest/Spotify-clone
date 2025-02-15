import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import User from "./Models/Users.js";
import multer from "multer";
import path from "path";
import Music from "./Models/Musics.js";

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

// 🔹 Set up Multer for file uploads
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
  const { trackname,musictitle, trackuploader } = req.body;
  const tracklocation = req.file ? `/uploads/${req.file.filename}` : "";
  try {
    const umusic = new Music({
      musicname: trackname,
      musictitle:musictitle,
      musiclocation: tracklocation,
      uploaderid: trackuploader,
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

// to get the music from db
app.get("/activemusic", async (req, res) => {
  try {
    const music = await Music.find();
    res.status(200).json(music);
  } catch (error) {
    console.error("Error fetching music data:", error);
    res.status(500).json({ message: "Music not uploaded succesfully" });
  }
});
