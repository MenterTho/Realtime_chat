import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../lib/axios';
import { useContext } from 'react';
import { AuthContext } from '../context/authContext';
import toast from 'react-hot-toast';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { auth, login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.userId) {
      navigate('/');
    }
  }, [auth.userId, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/auth/login', { username, password });
      const { accessToken, refreshToken, userId, id, _id, username: resUsername, avatar } = res.data.data;
      const finalUserId = userId || id || _id;
      if (!finalUserId || !resUsername) {
        throw new Error('Invalid login response: Missing userId or username');
      }
      login(
        accessToken,
        finalUserId,
        resUsername,
        avatar || 'https://cdn.kona-blue.com/upload/kona-blue_com/post/images/2024/08/13/356/avatar-vo-tri-meo-3.jpg',
        refreshToken
      );
      toast.success('Đăng nhập thành công!');
      navigate('/');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại!';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-inter">
      <img
        src="https://pagedone.io/asset/uploads/1702362010.png"
        alt="gradient background image"
        className="fixed inset-0 w-full h-full object-cover z-[-1]"
      />

      <div className="mx-auto max-w-lg px-6 lg:px-8 py-20">
        <img
          src="/icon/communication.png"
          alt="Messenger logo"
          className="mx-auto lg:mb-11 mb-8 object-cover w-24 h-auto"
        />

        <div className="rounded-2xl bg-white shadow-xl">
          <form onSubmit={handleLogin} className="lg:p-11 p-7 mx-auto">
            <div className="mb-11">
              <h1 className="text-gray-900 text-center font-manrope text-3xl font-bold leading-10 mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-500 text-center text-base font-medium leading-6">
                Let’s get started with your 30 days free trial
              </p>
            </div>

            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-12 text-gray-900 placeholder:text-gray-400 text-lg font-normal leading-7 rounded-full border-gray-300 border shadow-sm focus:outline-none px-4 mb-6"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 text-gray-900 placeholder:text-gray-400 text-lg font-normal leading-7 rounded-full border-gray-300 border shadow-sm focus:outline-none px-4 mb-1"
            />

            {error && (
              <p className="text-red-500 text-sm mb-6">{error}</p>
            )}

            <div className="flex justify-end mb-6">
              <span className="text-indigo-600 text-base font-normal leading-6 cursor-pointer">
                Forgot Password?
              </span>
            </div>

            <button
              type="submit"
              className="w-full h-12 text-white text-center text-base font-semibold leading-6 rounded-full hover:bg-indigo-800 transition-all duration-700 bg-indigo-600 shadow-sm mb-11"
            >
              Login
            </button>

            <div className="flex justify-center text-gray-900 text-base font-medium leading-6">
              Don’t have an account?
              <span
                className="text-indigo-600 font-semibold pl-2 cursor-pointer"
                onClick={() => navigate('/register')}
              >
                Sign Up
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;