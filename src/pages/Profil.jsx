import React, { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profil = () => {
  const navigate = useNavigate();
  const [trainee, setTrainee] = useState({
    name: 'Trainee',
    program: 'FAT I',
    universitas: '-',
    jurusan: '-',
    asal_daerah: '-'
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('trainee_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        setTrainee(prev => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.error('Error parsing trainee data', e);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('trainee_token');
    localStorage.removeItem('trainee_data');
    navigate('/login');
  };

  const initials = trainee.name ? trainee.name.substring(0, 2).toUpperCase() : 'TR';

  return (
    <div>
      <div className="header-bg flex flex-col items-center" style={{ paddingBottom: '4rem' }}>
        <div className="avatar-circle mb-4" style={{ width: '80px', height: '80px', fontSize: '2rem', border: '3px solid var(--accent)' }}>
          {initials}
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">{trainee.name}</h1>
        <div className="status-badge" style={{ backgroundColor: '#217354', color: 'var(--accent)' }}>
          <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--accent)', borderRadius: '50%' }}></div>
          Trainee Aktif
        </div>
      </div>

      <div className="overlap-card">
        <div className="card mb-6">
          <h3 className="font-bold text-primary-dark mb-6 text-lg">Data Trainee</h3>
          
          <div className="mb-4">
            <p className="text-xs font-bold text-light mb-1 uppercase" style={{ opacity: 0.8, color: '#94a3b8' }}>Program Training</p>
            <p className="font-medium text-primary-dark text-sm">{trainee.program || '-'}</p>
          </div>
          
          <div className="mb-4">
            <p className="text-xs font-bold text-light mb-1 uppercase" style={{ opacity: 0.8, color: '#94a3b8' }}>Universitas / Institusi</p>
            <p className="font-medium text-primary-dark text-sm">{trainee.university || '-'}</p>
          </div>
          
          <div className="mb-4">
            <p className="text-xs font-bold text-light mb-1 uppercase" style={{ opacity: 0.8, color: '#94a3b8' }}>Jurusan</p>
            <p className="font-medium text-primary-dark text-sm">{trainee.major || '-'}</p>
          </div>
          
          <div>
            <p className="text-xs font-bold text-light mb-1 uppercase" style={{ opacity: 0.8, color: '#94a3b8' }}>Asal Daerah</p>
            <p className="font-medium text-primary-dark text-sm">{trainee.region || '-'}</p>
          </div>
        </div>

        <button className="btn-outline-danger" onClick={handleLogout}>
          <LogOut size={20} />
          Keluar Akun
        </button>
        
        <p className="text-center text-xs text-light mt-6 mb-4">Sistem Portal Trainee v1.0.0</p>
      </div>
    </div>
  );
};

export default Profil;
