import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, QrCode, ClipboardList, Star, User } from 'lucide-react';
import logoImg from '../assets/logo.png';

const BottomNav = () => {
  const navItems = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/absen', icon: QrCode, label: 'Absen' },
    { to: '/tugas', icon: ClipboardList, label: 'Tugas' },
    { to: '/evaluasi', icon: Star, label: 'Evaluasi' },
    { to: '/profil', icon: User, label: 'Profil' },
  ];

  return (
    <div className="bottom-nav-container">
      {/* Logo khusus Desktop di Sidebar */}
      <div className="sidebar-logo">
        <img src={logoImg} alt="First Resources" style={{ width: '100px', height: 'auto', marginBottom: '1rem', display: 'block', objectFit: 'contain', backgroundColor: 'white', padding: '6px', borderRadius: '8px' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'white' }}>FR Academy</h2>
      </div>

      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
        >
          <div className="nav-icon-wrapper">
            <item.icon className="nav-icon" />
          </div>
          <span className="nav-label">{item.label}</span>
          <div className="nav-indicator" />
        </NavLink>
      ))}
    </div>
  );
};

export default BottomNav;
