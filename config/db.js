const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Avoid multiple connections in serverless environment
    if (mongoose.connections[0].readyState) {
      console.log("✅ MongoDB already connected");
      return;
    }

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    // Don't exit process in serverless environment
    throw error;
  }
};

module.exports = connectDB;
