import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../lib/axios';
import { useAuth } from '../hooks/userAuth';
import Input from '../components/ui-btn/inputBtn';
import Button from '../components/ui-btn/button';
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
      console.log('Sending register request to:', `${import.meta.env.VITE_API_URL}/auth/register`);
      const res = await axios.post('/auth/register', { username, password });
      const { accessToken, userId, username: resUsername, avatar } = res.data.data;
      login(accessToken, userId, resUsername, avatar);
      toast.success('Đăng ký thành công!');
      navigate('/');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Đăng ký thất bại. Kiểm tra backend CORS!';
      console.error('Register error:', err.message, err.response?.data);
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center">Đăng ký</h2>
        <form onSubmit={handleRegister}>
          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit">Đăng ký</Button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default Register;