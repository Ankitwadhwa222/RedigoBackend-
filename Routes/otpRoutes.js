const jwt = require("jsonwebtoken");
const express = require('express');
const  OTP = require('../models/otp');
const sendOTP = require("../config/nodemailerconfig");
const emailService = require("../config/enhancedEmailService");

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

          // Try enhanced email service first (Resend + Nodemailer with fallback)
          try {
               const result = await emailService.sendOTP(email, "Your Redigo Verification Code", otp);
               console.log(`✅ OTP sent successfully via ${result.provider}:`, result.messageId);
               res.status(200).json({
                    message: "OTP sent successfully",
                    provider: result.provider
               });
          } catch (emailError) {
               console.error("❌ Enhanced email service failed, trying legacy:", emailError.message);
               
               // Fallback to original nodemailer as last resort
               try {
                    await sendOTP.sendMail(email, "Your OTP for Redigo", otp);
                    console.log("✅ OTP sent via legacy nodemailer");
                    res.status(200).json({
                         message: "OTP sent successfully", 
                         provider: "Legacy Nodemailer"
                    });
               } catch (legacyError) {
                    console.error("❌ All email methods failed:", legacyError.message);
                    // Still return success since OTP is saved in DB, user can retry
                    res.status(200).json({
                         message: "OTP generated and saved. Email delivery may be delayed due to service issues.",
                         warning: "Please check your email in a few minutes or request a new OTP if needed.",
                         emailError: true
                    });
               }
          }
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

// Email service status endpoint
router.get("/email-status", (req, res) => {
     const status = emailService.getStatus();
     res.status(200).json({
          status: status,
          message: status.hasAnyService ? "Email services available" : "No email services available",
          services: {
               resend: status.resend ? "Available" : "Not configured",
               nodemailer: status.nodemailer ? "Available" : "Not configured"
          }
     });
});

module.exports = router;