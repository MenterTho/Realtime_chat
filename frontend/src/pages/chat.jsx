import React, { useEffect, useRef, useState, useContext } from 'react';
import io from 'socket.io-client';
import axios from '../lib/axios';
import { AuthContext } from '../context/authContext';
import { SOCKET_URL } from '../constants';
import toast from 'react-hot-toast';
import Sidebar from '../components/ui-messages/sliderbar';
import ChatHeader from '../components/ui-messages/headerChat';
import ChatBody from '../components/ui-messages/messages';
import ChatInput from '../components/ui-messages/inputChat';

const Chat = () => {
  const { auth, setAuth } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('/user');
        setAllUsers(res.data.data.filter((user) => user.userId !== auth.userId));
      } catch {
        toast.error('Không thể tải danh sách người dùng');
      }
    };
    if (auth.accessToken) fetchUsers();
  }, [auth]);

  useEffect(() => {
    if (auth.accessToken && auth.userId) {
      const newSocket = io(SOCKET_URL, {
        auth: { token: auth.accessToken },
      });
      setSocket(newSocket);

      newSocket.on('onlineUsers', (users) => {
        setOnlineUsers(users.filter((user) => user._id !== auth.userId));
      });

      newSocket.on('message', (message) => {
        if (
          message.sender._id !== auth.userId &&
          (message.sender._id === selectedUser?._id || message.receiver._id === auth.userId)
        ) {
          setMessages((prev) => {
            if (!prev.some((msg) => msg._id === message._id)) {
              return [...prev, message];
            }
            return prev;
          });
        }
      });

      newSocket.on('updateProfile', (updatedUser) => {
        console.log('Received profile update in Chat:', updatedUser);
        setAllUsers((prev) =>
          prev.map((user) =>
            user.userId === updatedUser.userId
              ? { ...user, username: updatedUser.username, avatar: updatedUser.avatar }
              : user
          )
        );
        if (selectedUser?._id === updatedUser.userId) {
          setSelectedUser({
            _id: updatedUser.userId,
            username: updatedUser.username,
            avatar: updatedUser.avatar,
          });
        }
        if (updatedUser.userId === auth.userId) {
          setAuth((prev) => ({
            ...prev,
            username: updatedUser.username,
            avatar: updatedUser.avatar,
            isOnline: true,
          }));
          sessionStorage.setItem('username', updatedUser.username);
          sessionStorage.setItem('avatar', updatedUser.avatar);
          sessionStorage.setItem('isOnline', 'true');
        }
      });

      return () => newSocket.disconnect();
    }
  }, [auth, selectedUser, setAuth]);

  useEffect(() => {
    if (selectedUser && auth.accessToken) {
      const fetchMessages = async () => {
        try {
          const res = await axios.get(`/message/${selectedUser._id}`);
          setMessages(res.data.data);
        } catch {
          toast.error('Không thể tải lịch sử tin nhắn');
        }
      };
      fetchMessages();
    }
  }, [selectedUser, auth]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!content && !file) return;

    const formData = new FormData();
    formData.append('receiverId', selectedUser._id);
    if (content) formData.append('content', content);
    if (file) formData.append('file', file);

    try {
      const res = await axios.post('/message', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newMessage = res.data.data;
      setMessages((prev) => [...prev, newMessage]);
      socket.emit('sendMessage', {
        receiverId: selectedUser._id,
        content,
        fileUrl: newMessage.fileUrl,
        fileName: newMessage.fileName,
      });
      setContent('');
      setFile(null);
      document.getElementById('fileInput').value = null;
    } catch {
      toast.error('Gửi tin nhắn thất bại');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) setFile(selectedFile);
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const renderFile = (url, name, isOwnMessage) => {
    if (!url) return null;
    const ext = name.split('.').pop()?.toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      return <img src={url} alt={name} className="max-w-xs rounded mt-2" />;
    }

    return (
      <div
        className={`mt-2 p-2 rounded ${
          isOwnMessage ? 'bg-white' : 'bg-gray-100'
        }`}
      >
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-blue-600 hover:underline break-all"
        >
          📄 {name}
        </a>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#f4f7ff]">
      <Sidebar
        auth={auth}
        allUsers={allUsers}
        onlineUsers={onlineUsers}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
      />
      <main className="flex-1 flex flex-col bg-[#f4f7ff] rounded-[8px] m-4 overflow-hidden shadow">
        {selectedUser ? (
          <>
            <ChatHeader selectedUser={selectedUser} onlineUsers={onlineUsers} />
            <ChatBody
              messages={messages}
              auth={auth}
              formatTime={formatTime}
              renderFile={renderFile}
              messagesEndRef={messagesEndRef}
            />
            <ChatInput
              content={content}
              setContent={setContent}
              handleSendMessage={handleSendMessage}
              handleFileChange={handleFileChange}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Chọn một người dùng để bắt đầu trò chuyện
          </div>
        )}
      </main>
    </div>
  );
};

export default Chat;