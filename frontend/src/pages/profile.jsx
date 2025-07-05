import React, { useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import axios from '../lib/axios';
import { AuthContext } from '../context/authContext';
import { SOCKET_URL } from '../constants';
import Input from '../components/ui-btn/inputBtn';
import Button from '../components/ui-btn/button';
import toast from 'react-hot-toast';

const Profile = ({ isOpen, onClose }) => {
  const { auth, setAuth } = useContext(AuthContext);
  const [userData, setUserData] = useState({
    userId: '',
    username: '',
    avatar: '',
  });
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newAvatar, setNewAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState(null);

  // Debug auth context
  useEffect(() => {
    console.log('Auth in Profile:', auth);
    console.log('setAuth in Profile:', typeof setAuth);
    console.log('isOnline in Profile:', auth.isOnline);
  }, [auth, setAuth]);

  // Khởi tạo Socket.IO
  useEffect(() => {
    if (auth.accessToken) {
      const newSocket = io(SOCKET_URL, {
        auth: { token: auth.accessToken },
      });
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log(`Socket.IO connected for Profile: ${auth.username}`);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket.IO connect error:', error.message);
        toast.error('Kết nối Socket.IO thất bại');
      });

      newSocket.on('error', (error) => {
        console.error('Socket.IO error:', error);
        toast.error(`Socket.IO error: ${error}`);
      });

      return () => newSocket.disconnect();
    }
  }, [auth.accessToken]);

  // Lấy thông tin người dùng khi popup mở
  useEffect(() => {
    if (isOpen && auth.accessToken) {
      const fetchUser = async () => {
        try {
          const res = await axios.get('/user/profile');
          const { userId, id, _id, username, avatar } = res.data.data;
          const finalUserId = userId || id || _id;
          setUserData({ userId: finalUserId, username, avatar });
          setNewUsername(username);
          setAvatarPreview(avatar);
        } catch (err) {
          console.error('Fetch profile error:', err.response?.data?.message || err.message);
          toast.error('Không thể tải thông tin hồ sơ');
        }
      };
      fetchUser();
    }
  }, [isOpen, auth.accessToken]);

  // Xử lý chọn file avatar và tạo preview
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const allowedTypes = ['image/jpeg', 'image/png'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Chỉ hỗ trợ JPEG, PNG');
        return;
      }
      setNewAvatar(selectedFile);
      setAvatarPreview(URL.createObjectURL(selectedFile));
    }
  };

  // Xử lý cập nhật thông tin
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!newUsername) {
      toast.error('Vui lòng nhập username');
      return;
    }
    if (newPassword && newPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('username', newUsername);
    if (newPassword) formData.append('password', newPassword);
    if (newAvatar) formData.append('avatar', newAvatar);

    try {
      const res = await axios.put('/user/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const updatedUser = res.data.data;
      setUserData({
        userId: updatedUser.userId || updatedUser.id || updatedUser._id,
        username: updatedUser.username,
        avatar: updatedUser.avatar,
      });
      // Cập nhật auth context và sessionStorage
      if (typeof setAuth === 'function') {
        setAuth((prev) => ({
          ...prev,
          username: updatedUser.username,
          avatar: updatedUser.avatar,
          isOnline: true,
        }));
        sessionStorage.setItem('username', updatedUser.username);
        sessionStorage.setItem('avatar', updatedUser.avatar);
        sessionStorage.setItem('isOnline', 'true');
      } else {
        console.error('setAuth is not a function');
        toast.error('Lỗi cập nhật auth context');
      }
      // Gửi sự kiện updateProfile qua Socket.IO
      if (socket) {
        socket.emit('updateProfile', {
          userId: updatedUser.userId || updatedUser.id || updatedUser._id,
          username: updatedUser.username,
          avatar: updatedUser.avatar,
        });
        console.log('Emitting updateProfile:', {
          userId: updatedUser.userId || updatedUser.id || updatedUser._id,
          username: updatedUser.username,
          avatar: updatedUser.avatar,
        });
      }
      setIsEditing(false);
      setNewAvatar(null);
      setNewPassword('');
      setAvatarPreview(updatedUser.avatar);
      document.getElementById('avatarInput').value = null;
      toast.success('Cập nhật hồ sơ thành công');
    } catch (err) {
      console.error('Update profile error:', err.response?.data?.message || err.message);
      toast.error('Cập nhật hồ sơ thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  // Đóng popup và reset form
  const handleClose = () => {
    setIsEditing(false);
    setNewUsername(userData.username);
    setNewAvatar(null);
    setNewPassword('');
    setAvatarPreview(userData.avatar);
    document.getElementById('avatarInput')?.value && (document.getElementById('avatarInput').value = null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Hồ sơ người dùng</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            disabled={isLoading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nội dung */}
        <div className="flex flex-col items-center">
          <img
            src={avatarPreview || userData.avatar || 'https://via.placeholder.com/100'}
            alt={userData.username}
            className="w-24 h-24 rounded-full mb-4 object-cover"
          />
          {!isEditing ? (
            <>
              <h3 className="text-lg font-semibold text-gray-800">{userData.username}</h3>
              <p className="text-gray-500 text-sm">
                Trạng thái: {auth.isOnline === true ? 'Online' : 'Offline'}
              </p>
              <button
                onClick={() => setIsEditing(true)}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none disabled:bg-blue-300"
                disabled={isLoading}
              >
                Chỉnh sửa hồ sơ
              </button>
            </>
          ) : (
            <form onSubmit={handleUpdate} className="w-full space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Username</label>
                <Input
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Nhập username mới"
                  className="w-full"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Mật khẩu mới (để trống nếu không đổi)</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới"
                  className="w-full"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Avatar</label>
                <Input
                  type="file"
                  id="avatarInput"
                  accept="image/jpeg,image/png"
                  onChange={handleFileChange}
                  className="w-full"
                  disabled={isLoading}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  onClick={handleClose}
                  className="bg-gray-300 text-gray-800 hover:bg-gray-400 disabled:bg-gray-200"
                  disabled={isLoading}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      Đang lưu...
                    </div>
                  ) : (
                    'Lưu'
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;