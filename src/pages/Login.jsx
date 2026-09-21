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
      const response = await api.post('/api/trainee/login', { nik });
      if (response.data.status === 'success' || response.data.token) {
        localStorage.setItem('trainee_token', response.data.token);
        localStorage.setItem('trainee_data', JSON.stringify(response.data.trainee || {}));
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
    <div style={{ backgroundColor: 'var(--primary-dark)', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div className="card" style={{ width: '100%', padding: '2.5rem 1.5rem', textAlign: 'center', borderRadius: '16px' }}>
        <div style={{ backgroundColor: '#114c38', width: '80px', height: '100px', margin: '0 auto 1.5rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
           <div style={{ fontSize: '24px', fontWeight: 'bold' }}>FR</div>
           <div style={{ fontSize: '10px' }}>ACADEMY</div>
        </div>

        <h1 className="text-xl font-bold text-primary-dark">FR Academy</h1>
        <p className="text-light text-sm mb-6 mt-2">Portal Trainee Reguler</p>

        {error && <p className="text-sm text-danger mb-4 font-semibold">{error}</p>}

        <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
          <label className="text-sm font-semibold text-primary-dark mb-2 block">Nomor Induk Karyawan (NIK)</label>
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
            />
          </div>

          <button type="submit" className="btn-primary mb-4" style={{ padding: '1rem', fontSize: '1rem' }} disabled={loading}>
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <p className="text-xs text-light mt-4">Hanya untuk trainee yang sudah didaftarkan oleh Admin.</p>
      </div>
    </div>
  );
};

export default Login;
