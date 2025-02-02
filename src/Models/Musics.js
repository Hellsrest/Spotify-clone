import mongoose from "mongoose";
const musicSchema = new mongoose.Schema({
  musicname: { type: String, required: true },
    musiclocation: { type: String, required: true },
  uploaderid: { type: mongoose.Schema.Types.ObjectId, required: true }
});

const Music = mongoose.model('Muisc', musicSchema);

export default Music;