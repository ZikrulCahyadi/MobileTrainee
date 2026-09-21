import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, ClipboardList } from 'lucide-react';
import api from '../utils/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    todayAttendance: false,
    pendingTasks: 0,
    trainee: { name: '', program: '' }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/api/trainee/dashboard');
        setData(response.data.data || response.data);
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem('trainee_token');
          navigate('/login');
        }
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  const initials = data.trainee?.name ? data.trainee.name.substring(0, 2).toUpperCase() : 'SI';

  return (
    <div>
      <div className="header-bg">
        <p className="text-sm">Selamat datang kembali,</p>
        <h1 className="text-2xl font-bold mt-2 mb-2">
          {loading ? 'Memuat...' : (data.trainee?.name || 'Trainee')}
        </h1>
        <div className="status-badge" style={{ backgroundColor: '#217354', color: 'var(--accent)' }}>
          <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--accent)', borderRadius: '50%' }}></div>
          {loading ? '...' : (data.trainee?.program || 'FAT I')}
        </div>

        <div className="avatar-circle" style={{ position: 'absolute', top: '2rem', right: '1.5rem' }}>
          {initials}
        </div>
      </div>

      <div className="overlap-card">
        <div className="card flex items-center justify-between" style={{ padding: '1rem' }}>
          <div className="flex items-center gap-3">
             <div style={{ backgroundColor: '#f0fdf4', padding: '0.75rem', borderRadius: '12px', color: 'var(--accent)' }}>
               <CheckCircle size={24} />
             </div>
             <div>
               <p className="text-xs text-light">Absensi Hari Ini</p>
               <p className="font-bold text-primary-dark text-lg">
                 {loading ? '...' : (data.todayAttendance ? 'Sudah Absen' : 'Belum Absen')}
               </p>
             </div>
          </div>
          {!data.todayAttendance && (
            <Link to="/absen" className="btn-danger" style={{ textDecoration: 'none' }}>Scan QR</Link>
          )}
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div className="flex items-center gap-3 mb-4">
            <div style={{ backgroundColor: '#fffbeb', padding: '0.75rem', borderRadius: '12px', color: '#f59e0b' }}>
              <ClipboardList size={24} />
            </div>
            <div>
              <p className="text-xs text-light">Tugas Menunggu</p>
              <p className="font-bold text-primary-dark text-lg">
                {loading ? '...' : data.pendingTasks} <span className="text-sm font-medium text-light">tugas</span>
              </p>
            </div>
          </div>
          <Link to="/tugas" className="btn-primary" style={{ backgroundColor: '#f8fafc', color: 'var(--primary-dark)', border: '1px solid #e2e8f0', textDecoration: 'none' }}>
            Lihat Semua Tugas
          </Link>
        </div>

        <div className="banner-card">
          <h3 className="font-bold text-accent mb-2">Jadwal Training Aktif</h3>
          <p className="text-sm" style={{ opacity: 0.9 }}>
            Perhatikan materi harian dan jangan lupa untuk melakukan scan absen di setiap sesi.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
