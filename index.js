const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const rideRoutes = require("./Routes/Rideroutes");
const authRoutes = require("./Routes/Authroutes");
const otpRoutes = require("./Routes/otpRoutes");  
const userRoutes = require("./Routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const Chat = require("./models/chat");
const paymentRoutes = require("./Routes/paymentRoutes");
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/rides", rideRoutes);
app.use("/auth", authRoutes);
app.use("/auth", otpRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/payments", paymentRoutes);

// ✅ Store user-socket mapping for 1-on-1 chat
const userSockets = new Map();

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  // ✅ Register user with their socket
  socket.on('register-user', (userId) => {
    userSockets.set(userId, socket.id);
    socket.userId = userId;
    console.log(`👤 User ${userId} registered with socket ${socket.id}`);
  });

  // ✅ Join private 1-on-1 chat room
  socket.on('join-private-chat', (data) => {
    const { rideId, driverId, passengerId } = data;
    
    // ✅ Create a simple room ID for 1-on-1 chat
    const roomId = `ride-${rideId}`;
    socket.join(roomId);
    
    console.log(`🔐 User ${socket.userId} joined 1-on-1 chat room: ${roomId}`);
    
    // ✅ Store room info on socket
    socket.currentRoomId = roomId;
    socket.rideId = rideId;
    socket.driverId = driverId;
    socket.passengerId = passengerId;
  });

  // ✅ Handle private 1-on-1 messages
  // ✅ Handle private 1-on-1 messages with separate threads
socket.on('send-private-message', async (data) => {
  console.log('💬 1-on-1 message received:', data);
  
  try {
    // ✅ Create separate chat participants for each conversation
    const participants = [];
    if (data.driverId) participants.push(data.driverId);
    if (data.passengerId) participants.push(data.passengerId);
    
    // ✅ Save to database with specific participants
    const newMessage = new Chat({
      rideId: data.rideId,
      userId: data.userId,
      userName: data.userName,
      message: data.message,
      chatParticipants: participants,
      timestamp: new Date(data.timestamp)
    });
    
    const savedMessage = await newMessage.save();
    console.log('💾 Message saved:', savedMessage._id);
    
    const messageToSend = {
      _id: savedMessage._id,
      rideId: data.rideId,
      userId: data.userId,
      userName: data.userName,
      message: data.message,
      timestamp: savedMessage.timestamp
    };
    
    // ✅ Send only to the specific ride room
    const roomId = `ride-${data.rideId}`;
    console.log(`📤 Broadcasting to room: ${roomId}`);
    
    // ✅ Send to all participants in THIS specific conversation
    io.to(roomId).emit('receive-private-message', messageToSend);
    
  } catch (error) {
    console.error('❌ Error saving message:', error);
    socket.emit('message-error', { error: 'Failed to send message' });
  }
});

  // ✅ Handle typing indicators for 1-on-1
  socket.on('typing-private', (data) => {
    const roomId = `ride-${data.rideId}`;
    console.log(`⌨️ User ${data.userId} typing in room: ${roomId}`);
    socket.to(roomId).emit('user-typing-private', data);
  });

  socket.on('stop-typing-private', (data) => {
    const roomId = `ride-${data.rideId}`;
    console.log(`⌨️ User ${data.userId} stopped typing in room: ${roomId}`);
    socket.to(roomId).emit('user-stop-typing-private', data);
  });

  // ✅ Handle disconnect
  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
    
    if (socket.userId) {
      userSockets.delete(socket.userId);
      console.log(`🗑️ Removed user ${socket.userId} from socket mapping`);
    }
  });

  socket.on('error', (error) => {
    console.error('🚨 Socket error:', error);
  });
  // ✅ DRIVER SENDS LIVE LOCATION
socket.on("driver-location-update", (data) => {
  const { driverId, rideId, latitude, longitude } = data;

  // Broadcast to the passenger in this ride room
  const roomId = `ride-${rideId}`;
  console.log(`📍 Driver ${driverId} updated location for ${roomId}:`, latitude, longitude);
  
  io.to(roomId).emit("receive-driver-location", {
    driverId,
    latitude,
    longitude,
    timestamp: new Date()
  });
});


// Add these socket events after your existing chat events:

// ✅ Enhanced location tracking with route data
socket.on('location-update', (data) => {
  console.log('📍 Location update with movement:', {
    userId: data.userId,
    rideId: data.rideId,
    userRole: data.userRole,
    speed: data.coords.speed,
    accuracy: data.coords.accuracy,
    lat: data.coords.lat,
    lng: data.coords.lng
  });
  
  // Broadcast to all users in the same ride except sender
  socket.to(`ride-${data.rideId}`).emit('receive-location-update', {
    userId: data.userId,
    rideId: data.rideId,
    userRole: data.userRole,
    coords: data.coords,
    rotation: data.rotation,
    timestamp: data.timestamp
  });
});

socket.on('join-ride-tracking', (data) => {
  console.log('🚗 User joined ride tracking:', data.rideId, 'User:', data.userId, 'Role:', data.userRole);
  socket.join(`ride-${data.rideId}`);
  
  // Notify others that user started tracking
  socket.to(`ride-${data.rideId}`).emit('user-started-tracking', {
    userId: data.userId,
    userRole: data.userRole,
    message: `${data.userRole} started location tracking`
  });
});

socket.on('leave-ride-tracking', (data) => {
  console.log('🚪 User left ride tracking:', data.rideId, 'User:', data.userId);
  socket.leave(`ride-${data.rideId}`);
  
  // Notify others that user stopped tracking
  socket.to(`ride-${data.rideId}`).emit('user-stopped-tracking', {
    userId: data.userId,
    message: 'User stopped location tracking'
  });
});
});






// Connect to database
connectDB();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`💬 1-on-1 Chat System Ready`);
});