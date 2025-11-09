const mongoose = require('mongoose');
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

// ✅ FIXED: Dashboard Stats
const getDashboardStats = async (req, res) => {
  try {
    console.log('📊 getDashboardStats called');
    console.log('📊 User from req.user:', req.user);
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const userId = req.user._id; // ✅ Use _id consistently
    console.log('📊 Calculating stats for user:', userId);
    
    const Ride = require('../models/Ride');

    // ✅ Convert to ObjectId to avoid cast errors
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Get user's posted rides
    const userRides = await Ride.find({ driverId: userObjectId });
    console.log(`📊 User posted rides: ${userRides.length}`);
    
    // Get user's booked rides (rides where user is a passenger)
    const bookedRides = await Ride.find({ 
      'passengers.userId': userObjectId 
    });
    console.log(`📊 User booked rides: ${bookedRides.length}`);

    // Calculate stats
    const totalRidesOffered = userRides.length;
    const totalRidesBooked = bookedRides.length;
    
    // Calculate earnings from posted rides
    const totalEarnings = userRides.reduce((sum, ride) => {
      const passengers = ride.passengers || [];
      return sum + (passengers.length * (ride.price || 0));
    }, 0);

    // Calculate money spent on booked rides
    const totalSpent = bookedRides.reduce((sum, ride) => {
      return sum + (ride.price || 0);
    }, 0);

    // Count rides by status
    const completedRides = userRides.filter(ride => ride.status === 'completed').length;
    const activeRides = userRides.filter(ride => 
      ride.status === 'active' || ride.status === 'scheduled' || !ride.status
    ).length;
    const cancelledRides = userRides.filter(ride => ride.status === 'cancelled').length;

    // Count total passengers served
    const totalPassengers = userRides.reduce((sum, ride) => {
      return sum + (ride.passengers?.length || 0);
    }, 0);

    // Count upcoming rides
    const upcomingRides = userRides.filter(ride => {
      const rideDate = new Date(ride.date);
      const now = new Date();
      return rideDate > now && (ride.status !== 'cancelled' && ride.status !== 'completed');
    }).length;

    const stats = {
      totalRidesOffered,
      totalRidesBooked,
      totalEarnings,
      totalSpent,
      completedRides,
      activeRides,
      cancelledRides,
      totalPassengers,
      upcomingRides
    };

    console.log('📊 Calculated stats:', stats);

    res.status(200).json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
};

// ✅ FIXED: Get User Rides
const getUserRidesNew = async (req, res) => {
  try {
    console.log('🔍 getUserRidesNew called');
    console.log('🔍 User from req.user:', req.user);
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const userId = req.user._id; // ✅ Use _id consistently
    console.log('🔍 Fetching rides for user:', userId);
    
    const Ride = require('../models/Ride');
    
    // ✅ Convert to ObjectId to avoid cast errors
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    // ✅ Use only driverId field (most common in ride schemas)
    const rides = await Ride.find({ driverId: userObjectId })
      .populate('passengers.userId', 'name email phone')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${rides.length} rides for user ${userId}`);
    
    res.status(200).json({
      success: true,
      rides,
      count: rides.length
    });

  } catch (error) {
    console.error('❌ Error fetching user rides:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rides',
      error: error.message
    });
  }
};

// ✅ FIXED: Get Booked Rides
const getBookedRides = async (req, res) => {
  try {
    console.log('🔍 getBookedRides called');
    console.log('🔍 User from req.user:', req.user);
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const userId = req.user._id; // ✅ Use _id consistently
    console.log('🔍 Fetching booked rides for user:', userId);
    
    const Ride = require('../models/Ride');
    
    // ✅ Convert to ObjectId to avoid cast errors
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const bookedRides = await Ride.find({ 
      'passengers.userId': userObjectId 
    })
    .populate('driverId', 'name email phone')
    .sort({ createdAt: -1 });

    console.log(`✅ Found ${bookedRides.length} booked rides for user ${userId}`);

    // Add driver info to response
    const ridesWithDriverInfo = bookedRides.map(ride => ({
      ...ride.toObject(),
      driverName: ride.driverId?.name || 'Unknown Driver',
      driverPhone: ride.driverId?.phone || null,
      driverEmail: ride.driverId?.email || null
    }));

    res.status(200).json({
      success: true,
      bookedRides: ridesWithDriverInfo,
      count: ridesWithDriverInfo.length
    });

  } catch (error) {
    console.error('❌ Error fetching booked rides:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booked rides',
      error: error.message
    });
  }
};

module.exports = {
  getMyRides,
  getProfile,
  updateProfile,
  updateRideStatus,
  deleteRide,
  getDashboardStats,
  getUserRidesNew,
  getBookedRides
};