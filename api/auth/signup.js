const connectDB = require('../../config/db');
const { signup } = require('../../controllers/authController');

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

    // Use the existing signup controller
    await signup(req, res);
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}