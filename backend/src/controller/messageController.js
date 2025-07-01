const messageService = require('../services/messageServices');
const User = require('../model/userModel');

const getMessages = async (req, res, next) => {
  try {
    const messages = await messageService.getMessages(req.user.id, req.params.userId);
    res.json({ message: 'Lấy danh sách tin nhắn thành công', data: messages });
  } catch (error) {
    console.error('Error getting messages:', error.message);
    next(error);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content } = req.body;
    const file = req.file;
    if (!receiverId || (!content && !file)) {
      return res.status(400).json({ message: 'Thất bại', error: 'Receiver ID and content or file are required' });
    }
    const message = await messageService.sendMessage(req.user.id, receiverId, content, file);
    const io = req.app.get('socketio');
    if (io) {
      try {
        const receiver = await User.findById(receiverId);
        if (receiver && receiver.socketId) {
          io.to(receiver.socketId).emit('message', message);
          console.log(`Message sent to receiver ${receiverId} socketId ${receiver.socketId}`);
        } else {
          console.log(`Receiver ${receiverId} not online or no socketId`);
        }
      } catch (socketError) {
        console.error('Socket.IO emit error:', socketError.message);
      }
    } else {
      console.error('Socket.IO instance not found in messageController');
    }
    res.json({ message: 'Gửi tin nhắn thành công', data: message });
  } catch (error) {
    console.error('Error sending message:', error.message);
    next(error);
  }
};

module.exports = { getMessages, sendMessage };