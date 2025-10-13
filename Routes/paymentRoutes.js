const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const router = express.Router();

// ✅ Debug environment variables
console.log("🔍 Environment check in paymentRoutes:");
console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID ? `${process.env.RAZORPAY_KEY_ID.substring(0, 10)}...` : "❌ Missing");
console.log("RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET ? "✅ Loaded" : "❌ Missing");

// ✅ Initialize Razorpay instance with better error handling
let razorpay;
try {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Missing Razorpay credentials in environment variables");
  }
  
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  console.log("✅ Razorpay initialized successfully");
} catch (error) {
  console.error("❌ Razorpay initialization failed:", error.message);
}

// ✅ Test route FIRST - to check if routes are accessible
router.get("/test", (req, res) => {
  console.log("🧪 Test route accessed");
  res.json({
    success: true,
    message: "Payment routes are working!",
    razorpayConfigured: !!razorpay,
    environment: {
      hasKeyId: !!process.env.RAZORPAY_KEY_ID,
      hasKeySecret: !!process.env.RAZORPAY_KEY_SECRET,
      nodeEnv: process.env.NODE_ENV || 'development'
    },
    timestamp: new Date().toISOString()
  });
});

// ✅ Create Order Route
// In your paymentRoutes.js create-order route
router.post("/create-order", async (req, res) => {
  try {
    console.log("📝 Create order request received");
    const { amount, rideId, userId } = req.body;

    // ✅ Validation...
    if (!razorpay) {
      return res.status(500).json({
        success: false,
        message: "Payment service not available"
      });
    }

    // ✅ Create a shorter receipt (max 40 characters)
    const shortRideId = rideId.slice(-8); // Take last 8 characters
    const timestamp = Date.now().toString().slice(-6); // Take last 6 digits
    const shortReceipt = `ride_${shortRideId}_${timestamp}`; // This will be ~20 characters
    
    console.log("🧾 Receipt created:", shortReceipt, "Length:", shortReceipt.length);

    const options = {
      amount: Number(amount) * 100, // Convert to paise
      currency: "INR",
      receipt: shortReceipt, // ✅ Use shorter receipt
      payment_capture: 1,
    };

    console.log("🔄 Creating Razorpay order with options:", options);
    
    const order = await razorpay.orders.create(options);
    console.log("✅ Order created successfully:", order.id);
    
    res.status(200).json({
      success: true,
      order: order,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
    
  } catch (error) {
    console.error("❌ Create order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
      razorpayError: error.error // Include Razorpay specific error
    });
  }
});

// ✅ Verify Payment Route
router.post("/verify-payment", async (req, res) => {
  try {
    console.log("🔍 Verify payment request received");
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, rideId, userId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification data"
      });
    }

    // Create signature for verification
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      console.log("✅ Payment verified successfully");
      
      res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        rideId: rideId
      });
    } else {
      console.log("❌ Payment verification failed - signature mismatch");
      res.status(400).json({
        success: false,
        message: "Payment verification failed"
      });
    }
  } catch (error) {
    console.error("❌ Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification error",
      error: error.message,
    });
  }

  
});


module.exports = router;