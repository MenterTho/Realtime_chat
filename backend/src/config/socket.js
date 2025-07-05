const socketIo = require('socket.io');
const { socketAuthMiddleware } = require('../middleware/authMiddleware');
const User = require('../model/userModel');
const userService = require('../services/userServices');

const initializeSocket = (server) => {
  const io = socketIo(server, {
    cors: { 
      origin: 'http://localhost:5173', 
      methods: ['GET', 'POST'],
      credentials: true 
    },
  });

  io.use(socketAuthMiddleware);

  io.on('connection', async (socket) => {
    console.log(`User ${socket.user.id} connected with socketId ${socket.id}`);

    try {
      // Cập nhật trạng thái online và socketId
      const updatedUser = await User.findByIdAndUpdate(
        socket.user.id,
        { isOnline: true, socketId: socket.id },
        { new: true }
      );
      if (!updatedUser) {
        console.error(`User ${socket.user.id} not found in database`);
        socket.disconnect();
        return;
      }

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

      // Xử lý cập nhật hồ sơ
      socket.on('updateProfile', async ({ userId, username, avatar }) => {
        try {
          // Kiểm tra quyền
          if (userId !== socket.user.id) {
            socket.emit('error', 'Không có quyền cập nhật hồ sơ của người khác');
            return;
          }

          // Cập nhật thông tin người dùng
          const user = await userService.getProfile(userId);
          if (!user) {
            socket.emit('error', 'Người dùng không tồn tại');
            return;
          }

          // Chỉ cập nhật các trường được gửi
          const updates = {};
          if (username) updates.username = username;
          if (avatar) updates.avatar = avatar;

          const updatedUser = await userService.updateProfile(userId, updates, null);
          
          // Thông báo cập nhật hồ sơ đến tất cả client
          io.emit('updateProfile', {
            userId: updatedUser._id,
            username: updatedUser.username,
            avatar: updatedUser.avatar,
          });
          console.log(`Profile updated for user ${userId}: ${updatedUser.username}, ${updatedUser.avatar}`);
        } catch (error) {
          console.error('Update profile error:', error.message);
          socket.emit('error', `Cập nhật hồ sơ thất bại: ${error.message}`);
        }
      });

      socket.on('sendMessage', async ({ receiverId, content, fileUrl, fileName }) => {
        // Logic gửi tin nhắn đã được chuyển sang messageController.js
        console.log(`Received sendMessage event from ${socket.user.id} to ${receiverId}, content: ${content}`);
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
    } catch (error) {
      console.error('Socket connection error:', error.message);
      socket.emit('error', 'Socket connection failed');
      socket.disconnect();
    }
  });

  return io;
};

module.exports = { initializeSocket };