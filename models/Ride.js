const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  availableSeats: { type: Number, required: true },
  price: { type: Number, required: true },
  distance: { type: String },
  duration: { type: String },
  driver: {
    userId : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
    name: { type: String, required: true },
    rating: { type: Number, default: 5 },
    phone: { type: String, required: true },
    email: { type: String },
  },
  car: {
    model: { type: String },
    color: { type: String },
    licensePlate: { type: String },
  },
  notes: { type: String },
  status: {
    type: String,
    enum: ["active", "completed", "cancelled"],
    default: "active"
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Ride', rideSchema);