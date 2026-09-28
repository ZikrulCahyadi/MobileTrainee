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
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      maxWidth: '480px',
      margin: '0 auto',
      backgroundColor: 'white',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '0.5rem 0 0', // Padding top only, bottom handled by items
      borderTop: '1px solid #e2e8f0',
      zIndex: 10,
      boxShadow: '0 -4px 20px rgba(0,0,0,0.03)'
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
            flex: 1,
            paddingBottom: '0.75rem',
            position: 'relative'
          })}
        >
          {({ isActive }) => (
            <>
              <div style={{
                backgroundColor: isActive ? '#e8fcf1' : 'transparent',
                padding: '8px 16px',
                borderRadius: '12px',
                marginBottom: '4px',
                transition: 'all 0.2s ease-in-out'
              }}>
                <item.icon size={24} color={isActive ? '#047857' : '#64748b'} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span style={{ 
                color: isActive ? '#047857' : '#64748b', 
                fontSize: '0.75rem', 
                fontWeight: isActive ? '700' : '500' 
              }}>
                {item.label}
              </span>
              
              {/* Active Bottom Indicator */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '15%',
                  width: '70%',
                  height: '4px',
                  backgroundColor: '#047857',
                  borderTopLeftRadius: '4px',
                  borderTopRightRadius: '4px'
                }} />
              )}
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
};

export default BottomNav;
