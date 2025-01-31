import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  uusername: { type: String, required: true },
  uemail: { type: String, required: true },
  upassword: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

export default User;