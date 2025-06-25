const authService = require('../services/authServices');

const register = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const result = await authService.register(username, password);
    res.status(201).json({ message: 'Đăng ký thành công', data: result });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);
    res.json({ message: 'Đăng nhập thành công', data: result });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    res.json({ message: 'Làm mới token thành công', data: result });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const result = await authService.logout(req.user.id);
    res.json({ message: 'Đăng xuất thành công', data: result });
  } catch (error) {
    next(error);
  }
};

const updatePassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const result = await authService.updatePassword(req.user.id, password);
    res.json({ message: 'Cập nhật mật khẩu thành công', data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, refreshToken, logout, updatePassword };