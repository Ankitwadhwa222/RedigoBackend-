const { 
  getUserRides, 
  getUserProfile, 
  updateUserProfile, 
  updateUserRideStatus,
  deleteUserRide
} = require("../service/userService");

const getMyRides = async (req, res) => {
  try {
    const result = await getUserRides(req.user._id);
    console.log(result);
    
    
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(500).json(result);
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const result = await getUserProfile(req.user._id);
    
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json(result);
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const result = await updateUserProfile(req.user._id, req.body);
    
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

const updateRideStatus = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { status } = req.body;
    
    const result = await updateUserRideStatus(rideId, req.user._id, status);
    
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

const deleteRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const result = await deleteUserRide(rideId, req.user._id);
    console.log(result);
    
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

module.exports = {
  getMyRides,
  getProfile,
  updateProfile,
  updateRideStatus,
  deleteRide
};