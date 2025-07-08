const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../model/userModel');
const Session = require('../model/auth/sessionModel');

const register = async (username, password) => {
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    throw new Error('Username already exists');
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword });
  await user.save();

  const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

  await Session.create({
    userId: user._id,
    refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return {
    accessToken,
    refreshToken,
    userId: user._id.toString(),
    username: user.username,
    avatar: user.avatar ,
  };
};

const login = async (username, password) => {
  const user = await User.findOne({ username }).select('+password');
  if (!user) {
    throw new Error('Invalid credentials');
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }
  const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

  await Session.findOneAndUpdate(
    { userId: user._id },
    { refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    { upsert: true }
  );

  return {
    accessToken,
    refreshToken,
    userId: user._id.toString(),
    username: user.username,
    avatar: user.avatar || 'https://cdn.kona-blue.com/upload/kona-blue_com/post/images/2024/08/13/356/avatar-vo-tri-meo-3.jpg',
  };
};

const refreshToken = async (refreshToken) => {
  const session = await Session.findOne({ refreshToken });
  if (!session || session.expiresAt < new Date()) {
    throw new Error('Invalid or expired refresh token');
  }

  try {
    const decoded = await jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) throw new Error('User not found');
    const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const newRefreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    await Session.findOneAndUpdate(
      { userId: user._id },
      { refreshToken: newRefreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
    );

    return {
      accessToken,
      refreshToken: newRefreshToken,
      userId: user._id.toString(),
      username: user.username,
      avatar: user.avatar || 'https://cdn.kona-blue.com/upload/kona-blue_com/post/images/2024/08/13/356/avatar-vo-tri-meo-3.jpg',
    };
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

const logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { socketId: null });
  await Session.deleteOne({ userId });
  return { message: 'Logged out' };
};

const updatePassword = async (userId, newPassword) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const user = await User.findByIdAndUpdate(userId, { password: hashedPassword }, { new: true });
  if (!user) throw new Error('User not found');
  return { message: 'Password updated' };
};

module.exports = { register, login, refreshToken, logout, updatePassword };