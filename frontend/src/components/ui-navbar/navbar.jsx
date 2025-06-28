import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/userAuth';
import Button from '../ui-btn/button';

function Navbar() {
  const { auth, logout } = useAuth();

  return (
    <nav className="bg-blue-500 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-xl font-bold">Chat App</div>
        <div className="flex gap-4">
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
              <Button onClick={logout} className="bg-red-500 hover:bg-red-600">
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