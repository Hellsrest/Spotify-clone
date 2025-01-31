import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import User from "./Models/Users.js";

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

  app.post("/login",async(req,res)=>{
    const{lemail,lpassword}=req.body;
    try{
      const exeuser= await User.findOne(
        {
          uemail:lemail,
          upassword:lpassword,
        })
        if (!exeuser){
          console.log("User does not exixst");
          res.status(404).json({message:"invalid login details"});
        }
        
        res.status(200).json({
          message: "Login details correct",
          user: exeuser, 
      });
    }catch(error){
      console.log(error);
      res.status(500).json({message:"user not found"});
    }
  })

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
