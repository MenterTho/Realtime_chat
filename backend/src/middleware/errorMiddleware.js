const errorMiddleware = (err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.message.includes('Invalid credentials') ||
                    err.message.includes('Access token required') ||
                    err.message.includes('Invalid or expired token') ||
                    err.message.includes('Invalid updates') ||
                    err.message.includes('User not found') ||
                    err.message.includes('Username already exists') ||
                    err.message.includes('Invalid or expired refresh token') ||
                    err.message.includes('Receiver not found')
                    ? 400
                    : err.message.includes('Admin access required')
                    ? 403
                    : 500;
  res.status(statusCode).json({ message: err.message || 'Internal Server Error' });
};

module.exports = errorMiddleware;