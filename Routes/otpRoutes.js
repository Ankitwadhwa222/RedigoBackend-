const jwt = require("jsonwebtoken");
const express = require('express');
const  OTP = require('../models/otp');
const sendOTP = require("../config/nodemailerconfig");

const User = require('../models/User');



const router = express.Router();

 
router.post("/send-otp" , async (req, res) => {
     const{email} = req.body;
     if(!email) return res.status(400).json({message : "Email is required"});


     try {
          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          const expiresAt = new Date(Date.now() + 5 * 60 * 1000); 

          await OTP.create({
               email,
               otp,
               expiresAt
          })
          await sendOTP.sendMail(email, "Your OTP for Redigo", otp);
          res.status(200).json({message : "OTP sent successfully"});
     }

     catch (error) {
          console.error("Error generating or sending OTP:", error);
          res.status(500).json({message : "Internal server error"});
     }
});

router.post("/verify-otp", async (req, res) => {
     const {email, otp} = req.body;
     if(!email || !otp) return res.status(400).json({message : "Email and OTP are required"});      
     try {
          const record = await OTP.findOne({email , otp}); 
          if(!record) return res.status(400).json({message : "Invalid OTP"});
          if(record.expiresAt < new Date()) {
               return res.status(400).json({message : "OTP has expired"});
          }
          await OTP.deleteOne({email, otp});

          const user = await User.findOne({email});
          if(!user) return res.status(400).json({message : "User not found"});

          const token = jwt.sign({id : user._id} , process.env.JWT_SECRET , {expiresIn : "1h"});

          res.status(200).json({message : "OTP verified successfully" , token});
     }
     catch (error) {
          console.error("Error verifying OTP:", error);
          res.status(500).json({message : "Internal server error"});
     }
});

module.exports = router;