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

  // Only allow GET method
  if (method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  res.status(200).json({
    message: 'Redigo Backend API is running!',
    status: 'active',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: 'vercel-serverless',
    endpoints: {
      auth: {
        signup: '/api/auth/signup',
        signin: '/api/auth/signin/email'
      },
      otp: {
        sendOTP: '/api/otp/send-otp'
      }
    }
  });
}