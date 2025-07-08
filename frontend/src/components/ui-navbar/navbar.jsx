import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/userAuth';
import Button from '../ui-btn/button';
import Profile from '../../pages/profile';
import toast from 'react-hot-toast';

function Navbar() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      logout();
      toast.success('Đăng xuất thành công');
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err.message);
      toast.error('Đăng xuất thất bại');
    }
  };

  return (
    <>
      <nav className="bg-white/40 backdrop-blur-md shadow-sm px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
            <span className="text-2xl">💬</span>
            <span>Chat App</span>
          </div>

          {/* Menu */}
          <div className="flex items-center gap-4">
            {auth.userId ? (
              <>
                <span className="text-gray-700 text-sm">Xin chào, {auth.username}</span>
                <img
                  src={auth.avatar || 'https://via.placeholder.com/40'}
                  alt={auth.username}
                  className="w-10 h-10 rounded-full cursor-pointer hover:opacity-90 border-2 border-blue-500"
                  onClick={() => setIsProfileOpen(true)}
                />
                <Button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 text-sm"
                >
                  Đăng xuất
                </Button>
              </>
            ) : (
              <Button
                onClick={() => navigate('/login')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-base font-semibold shadow-md transition duration-200"
              >
                Đăng nhập
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Profile Modal */}
      <Profile isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
}

export default Navbar;
