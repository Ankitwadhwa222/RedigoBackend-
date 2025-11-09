const express = require("express");
const { protect } = require("../middlewares/protect");
const { 
  getMyRides, 
  getProfile, 
  updateProfile, 
  updateRideStatus,
  deleteRide,
  getDashboardStats,
  getUserRidesNew,
  getBookedRides
} = require("../controllers/userController");

const router = express.Router();

// ✅ FIXED: Put specific routes BEFORE parameterized routes
// These routes must come BEFORE any routes with :rideId parameter

// User profile routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

// ✅ NEW: Dashboard routes - Put these FIRST
router.get('/dashboard-stats', protect, getDashboardStats);
router.get('/user-rides', protect, getUserRidesNew);
router.get('/booked-rides', protect, getBookedRides);

// Existing ride management routes
router.get("/my-rides", protect, getMyRides); 

// ✅ IMPORTANT: Parameterized routes go LAST
// These routes have :rideId parameter, so they must be after specific routes
router.put("/rides/:rideId/status", protect, updateRideStatus);
router.delete("/rides/:rideId", protect, deleteRide);

module.exports = router;