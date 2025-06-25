const express = require('express');
const http = require('http');
const connectDB = require('./config/db');
const morgan = require("morgan")
const { initializeSocket } = require('./config/socket');
const  appRoutes = require('./routes/serverRoutes')
const errorMiddleware = require('./middleware/errorMiddleware');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Khởi tạo Socket.IO
initializeSocket(server);

// Kết nối MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(morgan("combined"))

// Error middleware
app.use(errorMiddleware);

// Setup routes
appRoutes(app);

// Khởi động server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));