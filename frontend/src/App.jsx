import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from './lib/axios';
import { useAuth } from './hooks/userAuth';
import Navbar from './components/ui-navbar/navbar';
import Login from './pages/signin';
import Register from './pages/register';
import Chat from './pages/chat';
import { Toaster } from 'react-hot-toast';

function App() {
  const { auth, login, logout, refreshToken } = useAuth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const accessToken = sessionStorage.getItem('accessToken');
        if (!accessToken) throw new Error('No access token');

        console.log('Token used for /user/profile:', accessToken);
        console.log('Checking auth at:', `${import.meta.env.VITE_API_URL}/user/profile`);
        const res = await axios.get('/user/profile');
        console.log('Profile response:', res.data);
        const { userId, id, _id, username, avatar } = res.data.data;
        const finalUserId = userId || id || _id;
        if (!finalUserId) {
          throw new Error('User ID not found in profile response');
        }
        login(accessToken, finalUserId, username, avatar, sessionStorage.getItem('refreshToken'));
      } catch (err) {
        if (err.response?.status === 403 || err.response?.data?.message.includes('token')) {
          const refreshed = await refreshToken();
          if (!refreshed) {
            console.error('Failed to refresh token');
            logout();
          }
        } else {
          console.error('Check auth failed:', err.response?.data?.message || err.message);
          logout();
        }
      } finally {
        setIsCheckingAuth(false);
      }
    };
    if (sessionStorage.getItem('accessToken')) {
      checkAuth();
    } else {
      setIsCheckingAuth(false);
    }
  }, [login, logout, refreshToken]);

  useEffect(() => {
    console.log('Auth in App:', auth);
  }, [auth]);

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={auth.userId ? <Chat /> : <Navigate to="/login" />} />
          <Route path="/login" element={auth.userId ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={auth.userId ? <Navigate to="/" /> : <Register />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;