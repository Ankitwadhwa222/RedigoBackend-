const { addRide, searchRides , editRide , getRideById } = require("../service/rideService");

const createRide = async (req, res) => {
  try {
    const result = await addRide(req.body , req.user);
    if (result.success) return res.status(201).json(result);
    return res.status(500).json(result);

  }
  catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

};

const findRides = async (req, res) => {
  try {
    const result = await searchRides(req.query);
    if (result.success) return res.status(200).json(result);
    return res.status(500).json(result);
  }
  catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const editRideStats = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await editRide(id, req.user._id, req.body);
    
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

const rideUsingId = async (req, res) => {
  try {
    const { id } = req.params;
    const ride = await getRideById(id);
    if (ride) {
      return res.status(200).json({ success: true, ride });
    } else {
      return res.status(404).json({ success: false, message: "Ride not found" });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

module.exports = { createRide, findRides , editRideStats , rideUsingId };
