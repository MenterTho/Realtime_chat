import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/userAuth';
import Button from '../ui-btn/button';
import toast from 'react-hot-toast';

function Navbar() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.accessToken}`,
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
    <nav className="bg-blue-500 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-xl font-bold">Chat App</div>
        <div className="flex gap-4 items-center">
          {auth.userId && (
            <span className="text-white font-semibold">Xin chào, {auth.username}</span>
          )}
          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-white hover:text-gray-200 ${isActive ? 'underline' : ''}`
            }
          >
            Chat
          </NavLink>
          {auth.userId ? (
            <>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `text-white hover:text-gray-200 ${isActive ? 'underline' : ''}`
                }
              >
                Profile
              </NavLink>
              <Button onClick={handleLogout} className="bg-red-500 hover:bg-red-600">
                Đăng xuất
              </Button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `text-white hover:text-gray-200 ${isActive ? 'underline' : ''}`
                }
              >
                Đăng nhập
              </NavLink>
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `text-white hover:text-gray-200 ${isActive ? 'underline' : ''}`
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