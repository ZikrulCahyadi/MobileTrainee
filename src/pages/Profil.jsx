import React, { useState, useEffect } from 'react';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const BotanicalLeaf = ({ style }) => (
  <svg viewBox="0 0 100 100" style={style}>
    <path fill="currentColor" d="M10,90 Q15,40 50,10 Q80,20 90,60 Q80,85 50,90 Q20,95 10,90 Z" />
    <path fill="none" stroke="currentColor" strokeWidth="2" d="M10,90 Q30,60 50,10" />
    <path fill="none" stroke="currentColor" strokeWidth="1" d="M25,75 Q40,65 50,55" />
    <path fill="none" stroke="currentColor" strokeWidth="1" d="M35,60 Q50,55 60,45" />
    <path fill="none" stroke="currentColor" strokeWidth="1" d="M45,45 Q60,40 70,30" />
  </svg>
);

const Profil = () => {
  const navigate = useNavigate();
  const [trainee, setTrainee] = useState({
    name: 'Nama Peserta',
    program: '-',
    universitas: '-',
    jurusan: '-',
    asal_daerah: '-'
  });
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    // Load from local storage first for quick render
    try {
      const stored = localStorage.getItem('trainee_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        setTrainee(prev => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.error('Error parsing trainee data', e);
    }

    // Fetch fresh data from API
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) return;
        
        const response = await api.get('/trainee/profile');
        const result = response.data;
        if (result.status === 'success' && result.data) {
          setTrainee(prev => ({ ...prev, ...result.data }));
          localStorage.setItem('trainee_data', JSON.stringify(result.data));
        }
      } catch (error) {
        console.error('Error fetching fresh profile', error);
      }
    };
    
    fetchProfile();
  }, []);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('trainee_data');
    navigate('/login');
  };

  return (
    <div style={{ paddingBottom: '90px', backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      {/* PREMIUM HEADER */}
      <div style={{
        background: 'linear-gradient(135deg, #0d3829 0%, #175e47 50%, #0d3829 100%)',
        position: 'relative',
        overflow: 'hidden',
        color: 'white',
        padding: '3rem 1.5rem 5.5rem',
        borderBottomLeftRadius: '32px',
        borderBottomRightRadius: '32px',
        boxShadow: '0 10px 30px rgba(13, 56, 41, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Radial Glow */}
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(134,209,111,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        
        {/* Decorative Leaves */}
        <BotanicalLeaf style={{ position: 'absolute', top: '-10%', right: '-10%', width: '350px', height: '350px', color: '#114b3d', opacity: 0.4, transform: 'rotate(15deg)', pointerEvents: 'none' }} />
        <BotanicalLeaf style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '250px', height: '250px', color: '#1a6a51', opacity: 0.3, transform: 'rotate(45deg)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            width: '88px', height: '88px', borderRadius: '50%',
            backgroundColor: 'white', color: '#0d3829',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '3px solid #86d16f',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            marginBottom: '1rem'
          }}>
            <User size={40} strokeWidth={2.5} />
          </div>
          
          <h1 style={{ 
            fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.75rem', 
            lineHeight: '1.2', letterSpacing: '-0.5px', textAlign: 'center',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            padding: '0 1rem'
          }}>
            {trainee.name}
          </h1>
          
          <div style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            backgroundColor: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: '24px',
            backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#86d16f', borderRadius: '50%', boxShadow: '0 0 8px #86d16f' }}></div>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.5px' }}>Peserta Aktif</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '-3.5rem', padding: '0 1.25rem', position: 'relative', zIndex: 3 }}>
        <div className="card mb-6">
          <h3 className="font-bold text-primary-dark mb-6 text-lg">Data Peserta</h3>
          
                    <div className="mb-4">
            <p className="text-xs font-bold text-light mb-1 uppercase" style={{ opacity: 0.8, color: '#94a3b8' }}>Departemen / Kategori</p>
            <p className="font-medium text-primary-dark text-sm">{trainee.program || '-'}</p>
          </div>

          <div className="mb-4">
            <p className="text-xs font-bold text-light mb-1 uppercase" style={{ opacity: 0.8, color: '#94a3b8' }}>Materi Saat Ini</p>
            <p className="font-medium text-primary-dark text-sm">{trainee.materi || '-'}</p>
          </div>
          
          <div className="mb-4">
            <p className="text-xs font-bold text-light mb-1 uppercase" style={{ opacity: 0.8, color: '#94a3b8' }}>Talent To</p>
            <p className="font-medium text-primary-dark text-sm">{trainee.talent_to || '-'}</p>
          </div>
          
          <div className="mb-4">
            <p className="text-xs font-bold text-light mb-1 uppercase" style={{ opacity: 0.8, color: '#94a3b8' }}>Unit</p>
            <p className="font-medium text-primary-dark text-sm">{trainee.unit || '-'}</p>
          </div>
          
          <div>
            <p className="text-xs font-bold text-light mb-1 uppercase" style={{ opacity: 0.8, color: '#94a3b8' }}>Region</p>
            <p className="font-medium text-primary-dark text-sm">{trainee.region || '-'}</p>
          </div>
        </div>

        <button className="btn-outline-danger" onClick={handleLogout}>
          <LogOut size={20} />
          Keluar Akun
        </button>
        
        <p className="text-center text-xs text-light mt-6 mb-4">Sistem Portal Trainee v1.0.0</p>
      </div>

      {showLogoutModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          padding: '1.5rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '320px', padding: '1.5rem', textAlign: 'center', animation: 'scaleIn 0.2s ease-out' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <LogOut size={24} />
            </div>
            <h3 className="font-bold text-primary-dark text-lg mb-2">Keluar Akun</h3>
            <p className="text-sm text-light mb-6">Apakah Anda yakin ingin keluar dari akun ini?</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowLogoutModal(false)} 
                className="btn-primary" 
                style={{ flex: 1, backgroundColor: '#f8fafc', color: 'var(--primary-dark)', border: '1px solid #e2e8f0' }}
              >
                Batal
              </button>
              <button 
                onClick={confirmLogout} 
                className="btn-primary" 
                style={{ flex: 1, backgroundColor: '#ef4444', color: 'white', border: 'none' }}
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profil;




