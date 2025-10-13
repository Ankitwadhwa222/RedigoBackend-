// const http = require('http');
// const { Server } = require('socket.io');
// const Chat = require('../models/chat');

// const server = http.createServer();
// const io = new Server(server, {
//   cors: {
//     origin: ["http://localhost:5173", "http://localhost:3000"],
//     methods: ["GET", "POST"],
//     credentials: true
//   }
// });

// const users = new Map(); // userId -> socket.id

// io.on('connection', (socket) => {
//   console.log("🟢 User connected:", socket.id);

//   socket.on('register', (userId) => {
//     users.set(userId, socket.id);
//     console.log(`📍 Registered user ${userId} → socket ${socket.id}`);
//   });

//   socket.on('joinRoom', (roomId) => {
//     socket.join(roomId);
//     console.log(`👥 User ${socket.id} joined room: ${roomId}`);
//   });

//   socket.on('getChathistory' , async (roomId) => {
//      try {
//           const messages = await Chat.find({roomId}).sort({timestamp: 1});
//           socket.emit('chatHistory', messages);
//      } catch (error) {
//           console.error("Error fetching chat history:", error);
//      }
//   })

//   socket.on('send_message', async (data) => {
//     const { roomId, senderId, message } = data;
//     try {
//            const newChat = new Chat({ roomId, senderId, message });
//            await newChat.save();
//     } catch (error) {
//            console.error("Error saving chat message:", error);
//     }

//     console.log(`💬 ${senderId} sent message in ${roomId}: ${message}`);

//     io.to(roomId).emit('receive_message', {
//       senderId,
//       message,
//       timestamp: new Date(),
//     });
//   });

//   socket.on('disconnect', () => {
//     console.log("🔴 User disconnected:", socket.id);
//     for (const [userId, socketId] of users.entries()) {
//       if (socketId === socket.id) {
//         users.delete(userId);
//         console.log(`🗑️ Unregistered user: ${userId}`);
//         break;
//       }
//     }
//   });
// });

// server.listen(5000, () => console.log("✅ Socket.IO server running on port 5000"));
