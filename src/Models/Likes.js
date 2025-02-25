import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
  userid: { type: mongoose.Schema.Types.ObjectId, required: true },
  musicid: { type: mongoose.Schema.Types.ObjectId, required: true },
  date: { type: Date, default: Date.now }
});

const Like = mongoose.model("Like", likeSchema);

export default Like;
