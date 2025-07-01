const userService = require('../services/userServices');

const getProfile = async (req, res, next) => {
  try {
    const user = await userService.getProfile(req.user.id);
    res.json({
      message: 'Lấy thông tin cá nhân thành công',
      data: {
        userId: user._id,
        username: user.username,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await userService.updateProfile(req.user.id, req.body, req.file);
    res.json({
      message: 'Cập nhật thông tin cá nhân thành công',
      data: {
        userId: user._id,
        username: user.username,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const result = await userService.deleteUser(req.params.id);
    res.json({ message: 'Xóa người dùng thành công', data: result });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.json({
      message: 'Lấy danh sách người dùng thành công',
      data: users.map((user) => ({
        userId: user._id,
        username: user.username,
        avatar: user.avatar,
      })),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, deleteUser, getAllUsers };