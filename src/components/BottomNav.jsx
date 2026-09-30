import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ScanLine, ClipboardList, Star, User } from 'lucide-react';

const BottomNav = () => {
  const navItems = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/absen', icon: ScanLine, label: 'Absen' },
    { to: '/tugas', icon: ClipboardList, label: 'Tugas' },
    { to: '/evaluasi', icon: Star, label: 'Evaluasi' },
    { to: '/profil', icon: User, label: 'Profil' },
  ];

  return (
    <div className="bottom-nav-container">
      {/* Logo khusus Desktop di Sidebar */}
      <div className="sidebar-logo">
        <img src="https://www.helikonia.co.uk/wp-content/uploads/2021/03/first-resource-2.png" alt="First Resources Logo" style={{ width: '120px', height: 'auto', marginBottom: '1rem', display: 'block' }} />
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
