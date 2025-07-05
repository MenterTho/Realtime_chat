import React, { useState, useEffect } from 'react';
import axios from '../lib/axios';
import { useAuth } from '../hooks/userAuth';
import Input from '../components/ui-btn/inputBtn';
import Button from '../components/ui-btn/button';
import toast from 'react-hot-toast';

const Profile = ({ isOpen, onClose }) => {
  const { auth, setAuth } = useAuth();
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    avatar: '',
  });
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAvatar, setNewAvatar] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Lấy thông tin người dùng khi popup mở
  useEffect(() => {
    if (isOpen && auth.accessToken) {
      const fetchUser = async () => {
        try {
          const res = await axios.get('/user');
          const { username, email, avatar } = res.data.data;
          setUserData({ username, email, avatar });
          setNewUsername(username);
          setNewEmail(email);
        } catch (err) {
          console.error('Fetch user error:', err.response?.data?.message || err.message);
          toast.error('Không thể tải thông tin người dùng');
        }
      };
      fetchUser();
    }
  }, [isOpen, auth.accessToken]);

  // Xử lý chọn file avatar
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const allowedTypes = ['image/jpeg', 'image/png'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Chỉ hỗ trợ JPEG, PNG');
        return;
      }
      setNewAvatar(selectedFile);
    }
  };

  // Xử lý cập nhật thông tin
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!newUsername || !newEmail) {
      toast.error('Vui lòng nhập đầy đủ username và email');
      return;
    }

    const formData = new FormData();
    formData.append('username', newUsername);
    formData.append('email', newEmail);
    if (newAvatar) formData.append('avatar', newAvatar);

    try {
      const res = await axios.put('/user/update', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const updatedUser = res.data.data;
      setUserData({
        username: updatedUser.username,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
      });
      // Cập nhật auth context
      setAuth((prev) => ({
        ...prev,
        username: updatedUser.username,
        avatar: updatedUser.avatar,
      }));
      sessionStorage.setItem('username', updatedUser.username);
      sessionStorage.setItem('avatar', updatedUser.avatar);
      setIsEditing(false);
      setNewAvatar(null);
      document.getElementById('avatarInput').value = null;
      toast.success('Cập nhật thông tin thành công');
    } catch (err) {
      console.error('Update user error:', err.response?.data?.message || err.message);
      toast.error('Cập nhật thông tin thất bại');
    }
  };

  // Đóng popup và reset form
  const handleClose = () => {
    setIsEditing(false);
    setNewUsername(userData.username);
    setNewEmail(userData.email);
    setNewAvatar(null);
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
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nội dung */}
        <div className="flex flex-col items-center">
          <img
            src={userData.avatar || 'https://via.placeholder.com/100'}
            alt={userData.username}
            className="w-24 h-24 rounded-full mb-4 object-cover"
          />
          {!isEditing ? (
            <>
              <h3 className="text-lg font-semibold text-gray-800">{userData.username}</h3>
              <p className="text-gray-600">{userData.email}</p>
              <p className="text-gray-500 text-sm">
                Trạng thái: {auth.isOnline ? 'Online' : 'Offline'}
              </p>
              <button
                onClick={() => setIsEditing(true)}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none"
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
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Email</label>
                <Input
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Nhập email mới"
                  type="email"
                  className="w-full"
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
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" onClick={handleClose} className="bg-gray-300 text-gray-800 hover:bg-gray-400">
                  Hủy
                </Button>
                <Button type="submit" className="bg-blue-500 text-white hover:bg-blue-600">
                  Lưu
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