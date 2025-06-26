const Message = require('../model/messageModel');
const User = require('../model/userModel');
const cloudinary = require('../config/cloudinary');

const sendMessage = async (senderId, receiverId, content, file) => {
  const receiver = await User.findById(receiverId);
  if (!receiver) throw new Error('Receiver not found');
  if (!content && !file) throw new Error('Content or file is required');

  let fileUrl = null, fileName = null;
  if (file) {
    const allowedMimes = ['image/jpeg', 'image/png', 'video/mp4', 'application/pdf'];
    if (!file.mimetype || !allowedMimes.includes(file.mimetype)) {
      throw new Error('Invalid file format. Only JPEG, PNG, MP4, PDF allowed');
    }
    try {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: 'auto', folder: 'chat_files' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(file.buffer);
      });
      fileUrl = result.secure_url;
      fileName = file.originalname;
    } catch (error) {
      console.error('Error uploading file:', error.message);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  const message = new Message({ sender: senderId, receiver: receiverId, content, fileUrl, fileName });
  await message.save();
  return await Message.findById(message._id).populate('sender receiver', 'username avatar');
};

const getMessages = async (userId, otherUserId) => {
  return await Message.find({
    $or: [
      { sender: userId, receiver: otherUserId },
      { sender: otherUserId, receiver: userId },
    ],
  })
    .populate('sender receiver', 'username avatar')
    .sort('createdAt');
};

module.exports = { sendMessage, getMessages };