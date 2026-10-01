import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Absen from './pages/Absen';
import Tugas from './pages/Tugas';
import Profil from './pages/Profil';
import Evaluasi from './pages/Evaluasi';
import BottomNav from './components/BottomNav';

const Layout = ({ children }) => {
  const location = useLocation();
  const showNav = location.pathname !== '/login';

  return (
    <div className="mobile-container">
      <div className={`content-area ${!showNav ? 'no-sidebar' : ''}`} style={{ paddingBottom: showNav ? '70px' : '0' }}>
        {children}
      </div>
      {showNav && <BottomNav />}
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/absen" element={<ProtectedRoute><Absen /></ProtectedRoute>} />
          <Route path="/tugas" element={<ProtectedRoute><Tugas /></ProtectedRoute>} />
          <Route path="/profil" element={<ProtectedRoute><Profil /></ProtectedRoute>} />
          <Route path="/evaluasi" element={<ProtectedRoute><Evaluasi /></ProtectedRoute>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
