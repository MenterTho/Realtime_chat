require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/db');
const morgan = require("morgan")
const { initializeSocket } = require('./config/socket');
const  appRoutes = require('./routes/serverRoutes')
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();
const server = http.createServer(app);
// Cấu hình CORS cho HTTP
  app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
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