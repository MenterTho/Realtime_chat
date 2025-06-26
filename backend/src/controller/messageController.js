const messageService = require('../services/messageServices');

const getMessages = async (req, res, next) => {
  try {
    const messages = await messageService.getMessages(req.user.id, req.params.userId);
    res.json({ message: 'Lấy danh sách tin nhắn thành công', data: messages });
  } catch (error) {
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
    // Phát tin nhắn qua Socket.IO
    const io = req.app.get('socketio');
    io.to(receiverId).emit('message', message);
    io.to(req.user.id).emit('message', message);
    res.json({ message: 'Gửi tin nhắn thành công', data: message });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMessages, sendMessage };