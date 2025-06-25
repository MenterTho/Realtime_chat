const errorMiddleware = (err, req, res, next) => {
  console.error('Error:', err.message, err.stack);
  const statusCode = err.message.includes('Invalid credentials') ||
                    err.message.includes('Access token required') ||
                    err.message.includes('Invalid or expired token') ||
                    err.message.includes('Invalid updates') ||
                    err.message.includes('User not found') ||
                    err.message.includes('Username already exists') ||
                    err.message.includes('Invalid or expired refresh token') ||
                    err.message.includes('Receiver not found') ||
                    err.message.includes('Failed to upload avatar')
                    ? 400
                    : err.message.includes('Admin access required')
                    ? 403
                    : 500;
  res.status(statusCode).json({ message: 'Thất bại', error: err.message || 'Lỗi server' });
};

module.exports = errorMiddleware;