import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Absen from './pages/Absen';
import Tugas from './pages/Tugas';
import Profil from './pages/Profil';
import BottomNav from './components/BottomNav';

const Layout = ({ children }) => {
  const location = useLocation();
  const showNav = location.pathname !== '/login';

  return (
    <div className="mobile-container">
      <div className="content-area" style={{ paddingBottom: showNav ? '70px' : '0' }}>
        {children}
      </div>
      {showNav && <BottomNav />}
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/absen" element={<Absen />} />
          <Route path="/tugas" element={<Tugas />} />
          <Route path="/profil" element={<Profil />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
