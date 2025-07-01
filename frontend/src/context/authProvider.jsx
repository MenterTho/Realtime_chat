import { useState, useCallback } from 'react';
import { AuthContext } from './authContext';
import axios from '../lib/axios';
import toast from 'react-hot-toast';

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    accessToken: sessionStorage.getItem('accessToken') || null,
    userId: sessionStorage.getItem('userId') || null,
    username: sessionStorage.getItem('username') || null,
    avatar: sessionStorage.getItem('avatar') || null,
  });

  const login = useCallback((accessToken, userId, username, avatar, refreshToken) => {
    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('userId', userId);
    sessionStorage.setItem('username', username);
    sessionStorage.setItem('avatar', avatar);
    sessionStorage.setItem('refreshToken', refreshToken);
    setAuth({ accessToken, userId, username, avatar });
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('avatar');
    sessionStorage.removeItem('refreshToken');
    setAuth({ accessToken: null, userId: null, username: null, avatar: null });
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const refreshToken = sessionStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token');
      const res = await axios.post('/auth/refresh-token', { refreshToken });
      const { accessToken, refreshToken: newRefreshToken } = res.data.data;
      sessionStorage.setItem('accessToken', accessToken);
      sessionStorage.setItem('refreshToken', newRefreshToken);
      const profileRes = await axios.get('/user/profile');
      const { userId, id, _id, username, avatar } = profileRes.data.data;
      const finalUserId = userId || id || _id;
      if (!finalUserId) {
        throw new Error('User ID not found in profile response');
      }
      setAuth({ accessToken, userId: finalUserId, username, avatar });
      return true;
    } catch (err) {
      console.error('Refresh token failed:', err.response?.data?.message || err.message);
      logout();
      toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
      return false;
    }
  }, [logout]);

  return (
    <AuthContext.Provider value={{ auth, login, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}