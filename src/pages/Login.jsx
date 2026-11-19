import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IdCard } from 'lucide-react';
import api from '../utils/api';

const Login = () => {
  const navigate = useNavigate();
  const [nik, setNik] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Jika sudah memiliki sesi login, langsung arahkan ke dashboard
    const token = localStorage.getItem('auth_token');
    if (token) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/trainee/login', { nik: nik.trim() });
      const token = response.data.token || response.data.data?.token;
      const trainee = response.data.trainee || response.data.data?.trainee || {};
      
      if (response.data.status === 'success' || token) {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('trainee_data', JSON.stringify(trainee));
        navigate('/', { replace: true });
      } else {
        setError('Login gagal. Silakan periksa NIK Anda.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--primary-dark)', flex: 1, minHeight: '100vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem 1.5rem', textAlign: 'center', borderRadius: '16px', margin: '0 auto' }}>
        <img 
          src="/logo.png" 
          alt="First Resources" 
          style={{ width: '160px', height: 'auto', margin: '0 auto 1.25rem', display: 'block', objectFit: 'contain' }} 
        />

        <h1 className="text-2xl font-bold text-primary-dark mb-1">FR Academy</h1>
        <p className="text-sm text-light mb-6">Aplikasi Peserta Pelatihan</p>

        {error && <p className="text-sm text-danger mb-4 font-semibold">{error}</p>}

        <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
          <label className="text-sm font-semibold text-primary-dark block" style={{ marginBottom: '8px', paddingLeft: '2px' }}>Nomor Induk Karyawan (NIK)</label>
          <div className="input-container mb-6">
            <IdCard size={20} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Masukkan NIK Anda" 
              value={nik}
              onChange={(e) => setNik(e.target.value)}
              required 
              disabled={loading}
              style={{ fontSize: '14px' }}
            />
          </div>

          <button type="submit" className="btn-primary mb-4" style={{ padding: '0.9rem', fontSize: '1rem', fontWeight: 'bold' }} disabled={loading}>
            {loading ? 'Memproses...' : 'Login'}
          </button>
        </form>

        <p className="text-xs text-light mt-4" style={{ opacity: 0.85 }}>Learning &amp; Development - First Resources</p>
      </div>
    </div>
  );
};

export default Login;
