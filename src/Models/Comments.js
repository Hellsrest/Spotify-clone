import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  musicid: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Music', 
    required: true 
  },
  userid: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  comment: { 
    type: String, 
    required: true 
  },
  publishdate: { 
    type: Date, 
    default: Date.now 
  }
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;