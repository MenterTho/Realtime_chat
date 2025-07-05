import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../lib/axios';
import { useAuth } from '../hooks/userAuth';
import toast from 'react-hot-toast';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/auth/register', { username, password });
      const { accessToken, userId, username: resUsername, avatar } = res.data.data;
      login(accessToken, userId, resUsername, avatar);
      toast.success('Đăng ký thành công!');
      navigate('/');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Đăng ký thất bại. Kiểm tra backend CORS!';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-inter">
      {/* Nền gradient */}
      <img
        src="https://pagedone.io/asset/uploads/1702362010.png"
        alt="gradient background"
        className="fixed inset-0 w-full h-full object-cover z-[-1]"
      />

      <div className="mx-auto max-w-lg px-6 lg:px-8 py-20">
        <img
          src="../../public/icon/communication.png"
          alt="logo"
          className="mx-auto lg:mb-11 mb-8 object-cover w-24 h-auto"
        />

        <div className="rounded-2xl bg-white shadow-xl">
          <form onSubmit={handleRegister} className="lg:p-11 p-7 mx-auto">
            <div className="mb-11">
              <h1 className="text-gray-900 text-center font-manrope text-3xl font-bold leading-10 mb-2">
                Create Account
              </h1>
              <p className="text-gray-500 text-center text-base font-medium leading-6">
                Sign up to use the chat platform
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
              className="w-full h-12 text-gray-900 placeholder:text-gray-400 text-lg font-normal leading-7 rounded-full border-gray-300 border shadow-sm focus:outline-none px-4 mb-6"
            />

            <button
              type="submit"
              className="w-full h-12 text-white text-center text-base font-semibold leading-6 rounded-full hover:bg-indigo-800 transition-all duration-700 bg-indigo-600 shadow-sm mb-6"
            >
              Sign Up
            </button>

            {error && (
              <p className="text-red-500 text-center text-sm mb-4">{error}</p>
            )}

            <div className="flex justify-center text-gray-900 text-base font-medium leading-6">
              Already have an account?
              <span
                className="text-indigo-600 font-semibold pl-2 cursor-pointer"
                onClick={() => navigate('/login')}
              >
                Login
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
