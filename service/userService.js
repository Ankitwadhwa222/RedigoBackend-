const User = require("../models/User");
const Ride = require("../models/Ride");



const getUserRides = async (userId) => {
  try {
    const rides = await Ride.find({ 'driver.userId': userId })
                           .sort({ date: -1 }); 

    return {
      success: true,
      rides
    };
  } catch (err) {
    return {
      success: false,
      message: err.message
    };
  }
};

 
const getUserProfile = async (userId) => {
  try {
    const user = await User.findById(userId).populate('rides');
    
    if (!user) {
      return {
        success: false,
        message: "User not found"
      };
    }

    return {
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        totalRides: user.rides.length,
        rides: user.rides
      }
    };
  } catch (err) {
    return {
      success: false,
      message: err.message
    };
  }
};

 
const updateUserProfile = async (userId, updateData) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return {
        success: false,
        message: "User not found"
      };
    }

    return {
      success: true,
      message: "Profile updated successfully",
      user
    };
  } catch (err) {
    return {
      success: false,
      message: err.message
    };
  }
};

// Update ride status (user can only update their own rides)
const updateUserRideStatus = async (rideId, userId, status) => {
  try {
    const ride = await Ride.findOneAndUpdate(
      { _id: rideId, 'driver.userId': userId }, // Only owner can update
      { status },
      { new: true }
    );

    if (!ride) {
      return {
        success: false,
        message: "Ride not found or unauthorized"
      };
    }

    return {
      success: true,
      message: "Ride status updated successfully",
      ride
    };
  } catch (err) {
    return {
      success: false,
      message: err.message
    };
  }
};


const deleteUserRide = async (rideId, userId) => {
  try {
 
    const ride = await Ride.findOneAndDelete({
      _id: rideId,
      "driver.userId": userId,
    });

    if (!ride) {
      return {
        success: false,
        message: "Ride not found or unauthorized",
      };
    }

    await User.findByIdAndUpdate(userId, {
      $pull: { rides: rideId },
    });

    return {
      success: true,
      message: "Ride deleted successfully",
    };
  } catch (err) {
    return {
      success: false,
      message: "Internal server error",
      error: err.message,
    };
  }
};

module.exports = {
  getUserRides,
  getUserProfile,
  updateUserProfile,
  updateUserRideStatus,
  deleteUserRide
};