import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/userAuth';
import Button from '../ui-btn/button';
import toast from 'react-hot-toast';

function Navbar() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();

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

  // Đóng dropdown nếu click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-blue-600 p-4 shadow-sm">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-2xl font-bold tracking-wide">💬 Chat App</div>
        <div className="flex items-center gap-4 relative">
          {auth.userId ? (
            <>
              <div className="text-white font-medium hidden sm:block">Xin chào, {auth.username}</div>
              <div className="relative" ref={dropdownRef}>
                <img
                  src={auth.avatar || 'https://via.placeholder.com/40'}
                  alt="avatar"
                  className="w-10 h-10 rounded-full cursor-pointer border-2 border-white hover:shadow-md transition"
                  onClick={() => setShowDropdown((prev) => !prev)}
                />
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-md z-50">
                    <div className="p-4 border-b">
                      <p className="text-sm font-semibold">{auth.username}</p>
                      <p className="text-xs text-gray-500 truncate">{auth.userId}</p>
                    </div>
                    <ul className="text-sm">
                      <li>
                        <NavLink
                          to="/"
                          className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
                          onClick={() => setShowDropdown(false)}
                        >
                          Trang chủ
                        </NavLink>
                      </li>
                      <li>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                        >
                          Đăng xuất
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `text-white hover:underline ${isActive ? 'font-semibold underline' : ''}`
                }
              >
                Đăng nhập
              </NavLink>
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `text-white hover:underline ${isActive ? 'font-semibold underline' : ''}`
                }
              >
                Đăng ký
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
