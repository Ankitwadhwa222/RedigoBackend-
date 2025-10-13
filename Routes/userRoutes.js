const express = require("express");
const { protect } = require("../middlewares/protect");
const { 
  getMyRides, 
  getProfile, 
  updateProfile, 
  updateRideStatus,
  deleteRide
} = require("../controllers/userController");

const router = express.Router();


router.get("/profile", protect, getProfile);

router.put("/profile", protect, updateProfile);
router.get("/my-rides", protect, getMyRides); 


router.put("/rides/:rideId/status", protect, updateRideStatus);
router.delete("/rides/:rideId", protect, deleteRide);

module.exports = router;