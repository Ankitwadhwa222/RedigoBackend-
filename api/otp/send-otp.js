const connectDB = require('../../../config/db');
const OTP = require('../../../models/otp');
const { sendMail } = require('../../../config/nodemailerconfig');

// Connect to database
let isConnected = false;

async function connectToDatabase() {
  if (isConnected) return;
  
  try {
    await connectDB();
    isConnected = true;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

// CORS headers helper
function setCORSHeaders(res, origin) {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173', 
    'http://localhost:5175',
    'https://redigo-zeta.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean);

  if (!origin || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  }
}

export default async function handler(req, res) {
  const { method } = req;
  const origin = req.headers.origin;

  // Set CORS headers
  setCORSHeaders(res, origin);

  // Handle preflight OPTIONS request
  if (method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Only allow POST method
  if (method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    // Connect to database
    await connectToDatabase();

    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        message: "Email is required" 
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); 

    await OTP.create({
      email,
      otp,
      expiresAt
    });

    // Send OTP via nodemailer
    try {
      await sendMail(email, "Your Redigo Verification Code", otp);
      console.log("✅ OTP sent successfully via Nodemailer");
      res.status(200).json({
        message: "OTP sent successfully",
        provider: "Nodemailer"
      });
    } catch (emailError) {
      console.error("❌ Email sending failed:", emailError.message);
      // Still return success since OTP is saved in DB, user can retry
      res.status(200).json({
        message: "OTP generated and saved. Email delivery may be delayed due to service issues.",
        warning: "Please check your email in a few minutes or request a new OTP if needed.",
        emailError: true
      });
    }

  } catch (error) {
    console.error("❌ Error generating OTP:", error.message);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
}