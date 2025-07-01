import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from '../lib/axios';
import { useAuth } from '../hooks/userAuth';
import { SOCKET_URL } from '../constants';
import Input from '../components/ui-btn/inputBtn';
import Button from '../components/ui-btn/button';
import toast from 'react-hot-toast';

const Chat = () => {
  const { auth } = useAuth();
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  // Lấy danh sách tất cả người dùng
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('/user');
        setAllUsers(res.data.data.filter((user) => user.userId !== auth.userId));
      } catch (err) {
        console.error('Fetch users error:', err.response?.data?.message || err.message);
        if (err.response?.status === 403) {
          console.log('Using onlineUsers as fallback');
          setAllUsers(
            onlineUsers
              .filter((user) => user._id !== auth.userId)
              .map((user) => ({
                userId: user._id,
                username: user.username,
                avatar: user.avatar,
              }))
          );
        }
        toast.error('Không thể tải danh sách người dùng');
      }
    };
    if (auth.accessToken) {
      fetchUsers();
    }
  }, [auth.accessToken, auth.userId, onlineUsers]);

  // Khởi tạo Socket.IO
  useEffect(() => {
    if (auth.accessToken && auth.userId) {
      const newSocket = io(SOCKET_URL, {
        auth: { token: auth.accessToken },
      });
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log(`Socket.IO connected for ${auth.username}`);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket.IO connect error:', error.message);
        toast.error('Kết nối Socket.IO thất bại');
      });

      newSocket.on('onlineUsers', (users) => {
        console.log('Online users:', users);
        setOnlineUsers(users.filter((user) => user._id !== auth.userId));
      });

      newSocket.on('userStatus', ({ userId, isOnline }) => {
        console.log(`User status: ${userId} is ${isOnline ? 'online' : 'offline'}`);
        setOnlineUsers((prev) =>
          prev.map((user) =>
            user._id === userId ? { ...user, isOnline } : user
          )
        );
      });

      newSocket.on('message', (message) => {
        console.log('Received message:', message);
        // Chỉ thêm tin nhắn nếu không phải từ người gửi và thuộc về cuộc trò chuyện hiện tại
        if (
          message.sender._id !== auth.userId &&
          (message.sender._id === selectedUser?._id || message.receiver._id === auth.userId)
        ) {
          setMessages((prev) => {
            // Kiểm tra trùng _id chặt chẽ
            if (!prev.some((msg) => msg._id.toString() === message._id.toString())) {
              console.log('Adding new message from Socket.IO:', message._id);
              return [...prev, message];
            }
            console.log('Message already exists (Socket.IO):', message._id);
            return prev;
          });
        } else {
          console.log('Message ignored (Socket.IO):', message._id, 'Sender:', message.sender._id, 'Auth:', auth.userId);
        }
      });

      newSocket.on('error', (error) => {
        console.error('Socket.IO error:', error);
        toast.error(`Socket.IO error: ${error}`);
      });

      return () => newSocket.disconnect();
    }
  }, [auth.accessToken, auth.userId, auth.username, selectedUser]);

  // Tải lịch sử tin nhắn khi chọn người nhận
  useEffect(() => {
    if (selectedUser && auth.accessToken) {
      const fetchMessages = async () => {
        try {
          const res = await axios.get(`/message/${selectedUser._id}`);
          const newMessages = res.data.data;
          setMessages((prev) => {
            // Lọc bỏ tin nhắn đã có dựa trên _id
            const existingIds = new Set(prev.map((msg) => msg._id.toString()));
            const filteredMessages = newMessages.filter((msg) => !existingIds.has(msg._id.toString()));
            console.log('Fetched messages:', newMessages.length, 'New messages:', filteredMessages.length);
            return [...prev, ...filteredMessages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          });
        } catch (err) {
          console.error('Fetch messages error:', err.response?.data?.message || err.message);
          toast.error('Không thể tải lịch sử tin nhắn');
        }
      };
      fetchMessages();
    }
  }, [selectedUser, auth.accessToken]);

  // Cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Gửi tin nhắn
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!content && !file) {
      toast.error('Vui lòng nhập nội dung hoặc chọn file');
      return;
    }
    if (!selectedUser) {
      toast.error('Vui lòng chọn người nhận');
      return;
    }

    const formData = new FormData();
    formData.append('receiverId', selectedUser._id);
    if (content) formData.append('content', content);
    if (file) formData.append('file', file);

    try {
      const res = await axios.post('/message', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newMessage = res.data.data;
      setMessages((prev) => {
        if (!prev.some((msg) => msg._id.toString() === newMessage._id.toString())) {
          console.log('Adding new message from API:', newMessage._id);
          return [...prev, newMessage];
        }
        console.log('Message already exists (API):', newMessage._id);
        return prev;
      });
      socket.emit('sendMessage', {
        receiverId: selectedUser._id,
        content,
        fileUrl: newMessage.fileUrl,
        fileName: newMessage.fileName,
      });
      setContent('');
      setFile(null);
      document.getElementById('fileInput').value = null;
      toast.success('Gửi tin nhắn thành công');
    } catch (err) {
      console.error('Send message error:', err.response?.data?.message || err.message);
      toast.error('Gửi tin nhắn thất bại');
    }
  };

  // Xử lý chọn file
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'application/pdf'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Chỉ hỗ trợ JPEG, PNG, MP4, PDF');
        return;
      }
      setFile(selectedFile);
    }
  };

  // Hiển thị file (hình ảnh, video, PDF)
  const renderFile = (fileUrl, fileName) => {
    if (!fileUrl) return null;
    const extension = fileName?.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png'].includes(extension)) {
      return <img src={fileUrl} alt={fileName} className="max-w-xs rounded" />;
    } else if (extension === 'mp4') {
      return (
        <video controls className="max-w-xs">
          <source src={fileUrl} type="video/mp4" />
        </video>
      );
    } else if (extension === 'pdf') {
      return (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
          {fileName || 'Xem PDF'}
        </a>
      );
    }
    return null;
  };

  // Định dạng thời gian
  const formatTime = (date) => {
    return new Date(date).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-100">
      {/* Sidebar: Danh sách người dùng */}
      <div className="w-1/4 bg-white border-r p-4 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Người dùng</h2>
        {allUsers.length === 0 ? (
          <p className="text-gray-500">Không có người dùng</p>
        ) : (
          allUsers.map((user) => {
            const isOnline = onlineUsers.some((u) => u._id === user.userId);
            return (
              <div
                key={user.userId}
                className={`p-2 cursor-pointer flex items-center space-x-2 rounded ${
                  selectedUser?._id === user.userId ? 'bg-blue-100' : 'hover:bg-gray-100'
                }`}
                onClick={() => setSelectedUser({ _id: user.userId, username: user.username, avatar: user.avatar })}
              >
                <img
                  src={user.avatar || 'https://via.placeholder.com/32'}
                  alt={user.username}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <p className="font-semibold">{user.username}</p>
                  <p className="text-sm text-gray-500">{isOnline ? 'Online' : 'Offline'}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Chat area */}
      <div className="w-3/4 flex flex-col">
        {selectedUser ? (
          <>
            {/* Header: Tên người nhận */}
            <div className="bg-white p-4 border-b flex items-center space-x-2">
              <img
                src={selectedUser.avatar || 'https://via.placeholder.com/40'}
                alt={selectedUser.username}
                className="w-10 h-10 rounded-full"
              />
              <h2 className="text-lg font-bold">{selectedUser.username}</h2>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`mb-4 flex ${msg.sender._id === auth.userId ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-md p-3 rounded-lg ${
                      msg.sender._id === auth.userId ? 'bg-blue-500 text-white' : 'bg-white border'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <img
                        src={msg.sender.avatar || 'https://via.placeholder.com/24'}
                        alt={msg.sender.username}
                        className="w-6 h-6 rounded-full"
                      />
                      <p className="font-semibold">{msg.sender.username}</p>
                    </div>
                    {msg.content && <p>{msg.content}</p>}
                    {renderFile(msg.fileUrl, msg.fileName)}
                    <p className="text-xs text-gray-400 mt-1">{formatTime(msg.createdAt)}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input form */}
            <form onSubmit={handleSendMessage} className="bg-white p-4 border-t flex space-x-2">
              <Input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1"
              />
              <Input
                type="file"
                id="fileInput"
                accept="image/jpeg,image/png,video/mp4,application/pdf"
                onChange={handleFileChange}
                className="p-2"
              />
              <Button type="submit">Gửi</Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Chọn một người dùng để bắt đầu trò chuyện</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;