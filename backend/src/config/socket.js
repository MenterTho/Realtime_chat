const socketIo = require('socket.io');
const { socketAuthMiddleware } = require('../middleware/auth');
const messageService = require('../services/messageService');
const User = require('../models/User');

const initializeSocket = (server) => {
  const io = socketIo(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  io.use(socketAuthMiddleware);

  io.on('connection', async (socket) => {
    console.log(`User ${socket.user.id} connected`);

    await User.findByIdAndUpdate(socket.user.id, { isOnline: true, socketId: socket.id });
    io.emit('userStatus', { userId: socket.user.id, isOnline: true });

    const users = await User.find({ isOnline: true }).select('username isOnline _id');
    socket.emit('onlineUsers', users);

    socket.on('sendMessage', async ({ receiverId, content, fileUrl, fileName }) => {
      try {
        const message = await messageService.sendMessage(socket.user.id, receiverId, content, fileUrl, fileName);
        socket.emit('message', message);
        const receiver = await User.findById(receiverId);
        if (receiver && receiver.socketId) {
          io.to(receiver.socketId).emit('message', message);
        }
      } catch (error) {
        socket.emit('error', error.message);
      }
    });

    socket.on('disconnect', async () => {
      console.log(`User ${socket.user.id} disconnected`);
      await User.findByIdAndUpdate(socket.user.id, { isOnline: false, socketId: null });
      io.emit('userStatus', { userId: socket.user.id, isOnline: false });
    });
  });

  return io;
};

module.exports = { initializeSocket };