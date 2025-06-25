const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String },
  isOnline: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  socketId: { type: String },
});

module.exports = mongoose.model('User', userSchema);