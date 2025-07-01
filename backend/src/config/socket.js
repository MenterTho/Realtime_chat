const socketIo = require('socket.io');
const { socketAuthMiddleware } = require('../middleware/authMiddleware');
const messageService = require('../services/messageServices');
const User = require('../model/userModel');

const initializeSocket = (server) => {
  const io = socketIo(server, {
    cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] },
  });

  io.use(socketAuthMiddleware);

  io.on('connection', async (socket) => {
    console.log(`User ${socket.user.id} connected with socketId ${socket.id}`);

    // Cập nhật trạng thái online và socketId
    await User.findByIdAndUpdate(socket.user.id, { isOnline: true, socketId: socket.id }, { new: true });

    // Lấy danh sách người dùng online
    const users = await User.find({ isOnline: true }).select('username avatar _id isOnline socketId');
    io.emit('onlineUsers', users.map((user) => ({
      _id: user._id,
      username: user.username,
      avatar: user.avatar,
      isOnline: user.isOnline,
    })));

    // Emit userStatus
    io.emit('userStatus', { userId: socket.user.id, isOnline: true });

    socket.on('sendMessage', async ({ receiverId, content, fileUrl, fileName }) => {
      try {
        const message = await messageService.sendMessage(socket.user.id, receiverId, content, fileUrl, fileName);
        console.log('Sending message:', message);
        socket.emit('message', message);
        const receiver = await User.findById(receiverId);
        if (receiver && receiver.socketId) {
          io.to(receiver.socketId).emit('message', message);
        } else {
          console.log(`Receiver ${receiverId} not online or no socketId`);
        }
      } catch (error) {
        console.error('Send message error:', error.message);
        socket.emit('error', error.message);
      }
    });

    socket.on('disconnect', async () => {
      console.log(`User ${socket.user.id} disconnected`);
      await User.findByIdAndUpdate(socket.user.id, { isOnline: false, socketId: null }, { new: true });
      const users = await User.find({ isOnline: true }).select('username avatar _id isOnline socketId');
      io.emit('onlineUsers', users.map((user) => ({
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
        isOnline: user.isOnline,
      })));
      io.emit('userStatus', { userId: socket.user.id, isOnline: false });
    });
  });

  return io;
};

module.exports = { initializeSocket };