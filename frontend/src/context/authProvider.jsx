import { useState } from 'react';
import { AuthContext } from './authContext';

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    accessToken: localStorage.getItem('accessToken') || null,
    userId: localStorage.getItem('userId') || null,
    username: localStorage.getItem('username') || null,
    avatar: localStorage.getItem('avatar') || null,
  });

  const login = (accessToken, userId, username, avatar) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('userId', userId);
    localStorage.setItem('username', username);
    localStorage.setItem('avatar', avatar);
    setAuth({ accessToken, userId, username, avatar });
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('avatar');
    setAuth({ accessToken: null, userId: null, username: null, avatar: null });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}