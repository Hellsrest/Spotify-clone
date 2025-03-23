import mongoose from "mongoose";
const musicSchema = new mongoose.Schema({
  musicname: { type: String, required: true },
  musictitle: { type: String, required: true },
  musiclocation: { type: String, required: true },
  uploaderid: { type: mongoose.Schema.Types.ObjectId, ref: "User",  required: true },
});

const Music = mongoose.model("Music", musicSchema);

export default Music;
