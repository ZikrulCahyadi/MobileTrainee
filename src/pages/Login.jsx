import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IdCard } from 'lucide-react';
import api from '../utils/api';

const Login = () => {
  const navigate = useNavigate();
  const [nik, setNik] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/trainee/login', { nik });
      const token = response.data.token || response.data.data?.token;
      const trainee = response.data.trainee || response.data.data?.trainee || {};
      
      if (response.data.status === 'success' || token) {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('trainee_data', JSON.stringify(trainee));
        navigate('/');
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
          src="https://www.helikonia.co.uk/wp-content/uploads/2021/03/first-resource-2.png" 
          alt="First Resources Logo" 
          style={{ width: '220px', height: 'auto', margin: '0 auto 1.5rem', display: 'block' }} 
        />

        <h1 className="text-xl font-bold text-primary-dark mb-6 mt-2">FR Academy</h1>

        {error && <p className="text-sm text-danger mb-4 font-semibold">{error}</p>}

        <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
          <label className="text-sm font-semibold text-primary-dark block" style={{ marginBottom: '16px', paddingLeft: '4px' }}>Nomor Induk Kependudukan</label>
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

          <button type="submit" className="btn-primary mb-4" style={{ padding: '1rem', fontSize: '1rem' }} disabled={loading}>
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <p className="text-xs text-light mt-4">Hanya untuk peserta training yang sudah didaftarkan oleh Admin.</p>
      </div>
    </div>
  );
};

export default Login;
