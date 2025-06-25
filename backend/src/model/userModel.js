const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String ,default: 'https://cdn.kona-blue.com/upload/kona-blue_com/post/images/2024/08/13/356/avatar-vo-tri-meo-3.jpg' },
  
  isOnline: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  socketId: { type: String },
});

module.exports = mongoose.model('User', userSchema);