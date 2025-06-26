import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/signin';
import Register from './pages/register';
import Chat from './pages/chat';
import Profile from './pages/profile'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/messenger" element={<Chat />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;