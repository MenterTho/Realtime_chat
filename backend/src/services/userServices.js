const User = require('../model/userModel');
const authService = require('./authServices');
const Session = require('../model/auth/sessionModel');
const cloudinary = require('../config/cloudinary');

const getProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) throw new Error('User not found');
  return user;
};

const updateProfile = async (userId, updates, file) => {
  const allowedUpdates = ['username', 'password', 'avatar'];
  const updateKeys = Object.keys(updates);
  const isValid = updateKeys.every((key) => allowedUpdates.includes(key));
  if (!isValid) throw new Error('Invalid updates');
  if (!file && updateKeys.length === 0) throw new Error('No updates provided');

  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  if (updates.password) {
    await authService.updatePassword(userId, updates.password);
    delete updates.password;
  }
  if (updates.username) {
    user.username = updates.username;
  }
  if (file) {
    try {
      // Kiểm tra định dạng file
      const allowedMimes = ['image/jpeg', 'image/png'];
      if (!file.mimetype || !allowedMimes.includes(file.mimetype)) {
        throw new Error('Invalid file format. Only JPEG/PNG allowed');
      }
      // Kiểm tra file buffer
      if (!file.buffer) throw new Error('Invalid file provided: Missing buffer');
      // Xóa ảnh cũ nếu là URL Cloudinary
      if (user.avatar && user.avatar.includes('res.cloudinary.com')) {
        const publicId = user.avatar.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`chat_avatars/${publicId}`, { invalidate: true }).catch((err) => {
          console.error('Error deleting old avatar:', err.message);
        });
      }
      // Upload file từ buffer
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: 'image', folder: 'chat_avatars' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(file.buffer);
      });
      user.avatar = result.secure_url;
    } catch (error) {
      console.error('Error uploading avatar:', error.message);
      throw new Error(`Failed to upload avatar: ${error.message}`);
    }
  }

  await user.save();
  return user;
};

const deleteUser = async (userId) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) throw new Error('User not found');
  if (user.avatar && user.avatar.includes('res.cloudinary.com')) {
    const publicId = user.avatar.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(`chat_avatars/${publicId}`, { invalidate: true }).catch((err) => {
      console.error('Error deleting avatar:', err.message);
    });
  }
  await Session.deleteMany({ userId });
  return { message: 'User deleted' };
};

const getAllUsers = async () => {
  return await User.find().select('-password');
};

module.exports = { getProfile, updateProfile, deleteUser, getAllUsers };