const io = require('socket.io-client');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Hàm đăng nhập và lấy token + userId
async function login(username, password) {
  try {
    const res = await axios.post('http://localhost:3001/api/v1/auth/login', {
      username,
      password,
    });
    return {
      token: res.data.data.accessToken,
      userId: res.data.data.userId,
    };
  } catch (err) {
    console.error(`Login error for ${username}:`, err.response?.data?.message || err.message);
    return null;
  }
}

// Hàm tạo client Socket.IO
function createClient(username, token) {
  const socket = io('http://localhost:3001', {
    auth: { token },
  });

  socket.on('connect', () => {
    console.log(`Client ${username} connected`);
  });

  socket.on('onlineUsers', (users) => {
    console.log(`[${username}] Online users:`, users.map(u => `${u.username} (${u.isOnline ? 'online' : 'offline'})`));
  });

  socket.on('message', (message) => {
    console.log(`[${username}] Received message:`, {
      senderId: message.sender._id,
      receiverId: message.receiver._id,
      content: message.content,
      fileUrl: message.fileUrl,
      fileName: message.fileName,
    });
  });

  socket.on('userStatus', ({ userId, isOnline }) => {
    console.log(`[${username}] User ${userId} is ${isOnline ? 'online' : 'offline'}`);
  });

  socket.on('error', (error) => {
    console.error(`[${username}] Socket.IO error:`, error);
  });

  return socket;
}

// Hàm gửi tin nhắn qua API (bao gồm file)
async function sendMessageAPI(token, senderId, receiverId, content, filePath) {
  const formData = new FormData();
  formData.append('receiverId', receiverId);
  if (content) formData.append('content', content);
  if (filePath && fs.existsSync(filePath)) {
    formData.append('file', fs.createReadStream(filePath));
  } else if (filePath) {
    console.error('File not found:', filePath);
    return;
  }

  try {
    const res = await axios.post('http://localhost:3001/api/v1/message', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...formData.getHeaders(),
      },
    });
    console.log('API sendMessage response:', res.data);
  } catch (err) {
    console.error('API sendMessage error:', {
      status: err.response?.status,
      message: err.response?.data?.message || err.message,
    });
  }
}

// Hàm chạy test
async function runTest() {
  // Đăng nhập hai người dùng
  const user1 = await login('thodeptroai', 'newpassword123');
  const user2 = await login('kimanh', '123');

  if (!user1 || !user2) {
    console.error('Failed to get tokens or userIds');
    return;
  }

  console.log(`User1: ${user1.userId}, User2: ${user2.userId}`);

  // Tạo hai client Socket.IO
  const client1 = createClient('thodeptroai', user1.token);
  const client2 = createClient('kimanh', user2.token);

  // Đợi 2 giây để đảm bảo kết nối
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 1: Gửi tin nhắn qua Socket.IO (chỉ text)
  console.log(`Client thodeptroai sending message to kimanh via Socket.IO`);
  client1.emit('sendMessage', {
    receiverId: user2.userId,
    content: 'Xin chào từ thodeptroai!',
    fileUrl: null,
    fileName: null,
  });

  // Đợi 2 giây để nhận tin nhắn
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 2: Gửi tin nhắn qua Socket.IO (chỉ text)
  console.log(`Client kimanh sending message to thodeptroai via Socket.IO`);
  client2.emit('sendMessage', {
    receiverId: user1.userId,
    content: 'Xin chào từ kimanh!',
    fileUrl: null,
    fileName: null,
  });

  // Đợi 2 giây
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 3: Gửi tin nhắn qua API (text + file)
  console.log(`Client thodeptroai sending message to kimanh via API with file`);
  const filePath = path.resolve(__dirname, 'test.png'); // Thay bằng đường dẫn file thực tế
  await sendMessageAPI(user1.token, user1.userId, user2.userId, 'Tin nhắn API từ thodeptroai', filePath);

  // Đợi 2 giây
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 4: Lấy lịch sử tin nhắn qua API
  console.log(`Client thodeptroai getting messages with kimanh via API`);
  try {
    const res = await axios.get(`http://localhost:3001/api/v1/message/${user2.userId}`, {
      headers: { Authorization: `Bearer ${user1.token}` },
    });
    console.log('API getMessages response:', res.data);
  } catch (err) {
    console.error('API getMessages error:', {
      status: err.response?.status,
      message: err.response?.data?.message || err.message,
    });
  }

  // Đợi 2 giây trước khi ngắt kết nối
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Ngắt kết nối
  console.log('Disconnecting clients');
  client1.disconnect();
  client2.disconnect();
}

// Chạy test
runTest().catch(err => console.error('Test error:', err));