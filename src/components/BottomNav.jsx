import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ScanLine, ClipboardList, User } from 'lucide-react';

const BottomNav = () => {
  const navItems = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/absen', icon: ScanLine, label: 'Absen' },
    { to: '/tugas', icon: ClipboardList, label: 'Tugas' },
    { to: '/profil', icon: User, label: 'Profil' },
  ];

  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'white',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '0.75rem 0',
      borderTop: '1px solid #e2e8f0',
      zIndex: 10,
    }}>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textDecoration: 'none',
            color: isActive ? 'var(--primary-dark)' : 'var(--text-light)',
            fontSize: '0.75rem',
            fontWeight: isActive ? '600' : '500',
            gap: '0.25rem'
          })}
        >
          {({ isActive }) => (
            <>
              <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              {item.label}
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
};

export default BottomNav;
