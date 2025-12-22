const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("../config/db");

// Import Routes (simplified for serverless)
const rideRoutes = require("../Routes/Rideroutes");
const authRoutes = require("../Routes/Authroutes");
const otpRoutes = require("../Routes/otpRoutes");  
const userRoutes = require("../Routes/userRoutes");
const paymentRoutes = require("../Routes/paymentRoutes");

const app = express();

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173', 
  'http://localhost:5175',
  'https://redigo-zeta.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

console.log('🌐 Allowed Origins:', allowedOrigins);

// Manual CORS middleware that works better with Vercel serverless
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log('🔍 Request from origin:', origin);
  
  // Set CORS headers for all requests
  if (!origin || allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    console.log('✅ CORS headers set for origin:', origin);
  } else {
    console.log('❌ CORS blocked for origin:', origin);
  }
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    console.log('🚀 Handling preflight request');
    return res.sendStatus(204);
  }
  
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Connect to Database
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) return;
  
  try {
    await connectDB();
    isConnected = true;
    console.log('✅ Database connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

// Test CORS endpoint
app.get('/test-cors', (req, res) => {
  console.log('🧪 CORS test endpoint called');
  console.log('Origin:', req.headers.origin);
  console.log('Headers:', req.headers);
  
  res.json({
    message: 'CORS test successful!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString(),
    headers: res.getHeaders()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  console.log('🏠 Root endpoint called from origin:', req.headers.origin);
  res.json({
    message: 'Redigo Backend API is running!',
    status: 'active',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: 'serverless',
    cors: {
      origin: req.headers.origin,
      allowedOrigins: allowedOrigins
    },
    endpoints: {
      health: '/health',
      auth: '/auth/*',
      rides: '/api/rides/*',
      user: '/api/user/*',
      payments: '/api/payments/*',
      otp: '/api/otp/*'
    }
  });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await connectToDatabase();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      server: {
        environment: 'vercel-serverless',
        nodeVersion: process.version,
        memory: process.memoryUsage()
      },
      database: {
        status: isConnected ? 'connected' : 'disconnected'
      }
    });
  } catch (error) {
    console.error('❌ Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Middleware to ensure database connection
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('❌ Database middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection error',
      error: error.message
    });
  }
});

// API Routes
app.use("/api/rides", rideRoutes);
app.use("/auth", authRoutes);
app.use("/auth", otpRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/user", userRoutes);
app.use("/api/payments", paymentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Global Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /',
      'GET /health',
      'GET /api/rides',
      'POST /auth/login',
      'POST /auth/register',
      'GET /api/user/profile',
      'GET /api/payments',
      'POST /api/otp/send-otp'
    ]
  });
});

// For serverless functions, we need to export the app
module.exports = app;