import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from './lib/axios';
import { useAuth } from './hooks/userAuth';
import Navbar from './components/ui-navbar/navbar';
import Login from './pages/signin';
// import Register from './pages/register';
// import Chat from './pages/chat';
// import Profile from './pages/profile';
import { Toaster } from 'react-hot-toast';

function App() {
  const { auth, login } = useAuth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get('/user/profile');
        const { userId, username, avatar } = res.data.data;
        login(localStorage.getItem('accessToken'), userId, username, avatar);
      } catch (err) {
        console.error('Check auth failed:', err.response?.data?.error);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, [login]);

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
          {/* <Route path="/register" element={auth.userId ? <Navigate to="/" /> : <Register />} /> */}
          <Route path="/profile" element={auth.userId ? <Profile /> : <Navigate to="/login" />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;