const express = require("express");
const { createRide, findRides , editRideStats , rideUsingId } = require("../controllers/rideController");
const { protect } = require("../middlewares/protect");

const router = express.Router();

router.post("/addRide", protect, createRide);
router.get("/search", findRides);
router.put("/:id", protect, editRideStats);
router.get("/:id", rideUsingId);
 

module.exports = router;
