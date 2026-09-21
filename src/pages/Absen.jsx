import React, { useState } from 'react';
import { Camera, Upload, XCircle, QrCode } from 'lucide-react';

const Absen = () => {
  const [activeTab, setActiveTab] = useState('scan');

  return (
    <div className="p-4">
      <div className="card mb-4">
        <h2 className="text-xl font-bold text-primary-dark mb-1">Absensi Training</h2>
        <p className="text-sm text-light">Lakukan presensi dengan memindai QR Code dari Trainer.</p>
      </div>

      <div className="tab-container">
        <button 
          className={`tab-button ${activeTab === 'scan' ? 'active' : ''}`}
          onClick={() => setActiveTab('scan')}
        >
          Scan Kamera
        </button>
        <button 
          className={`tab-button ${activeTab === 'manual' ? 'active' : ''}`}
          onClick={() => setActiveTab('manual')}
        >
          Input Manual
        </button>
      </div>

      {activeTab === 'scan' && (
        <div className="card mb-6" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem' }}>
          <div style={{ width: '100%', height: '240px', border: '2px dashed #cbd5e1', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', backgroundColor: '#f8fafc' }}>
            <div style={{ backgroundColor: '#ecfccb', padding: '1rem', borderRadius: '50%', color: 'var(--primary-dark)', marginBottom: '1rem' }}>
              <Camera size={32} />
            </div>
            <button className="btn-primary" style={{ width: 'auto', padding: '0.75rem 2rem' }}>
              Aktifkan Kamera
            </button>
          </div>

          <button style={{ background: 'transparent', border: 'none', color: 'var(--primary-dark)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
            <Upload size={18} />
            <span style={{ textDecoration: 'underline' }}>Scan dari file gambar</span>
          </button>
        </div>
      )}

      {activeTab === 'manual' && (
        <div className="mb-6">
          <div className="card mb-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2.5rem 1rem' }}>
            <div style={{ backgroundColor: '#ecfccb', padding: '1rem', borderRadius: '50%', color: 'var(--primary-dark)', marginBottom: '1rem' }}>
              <QrCode size={32} />
            </div>
            <p className="text-sm text-center">Masukkan Token QR Code secara manual.</p>
          </div>
          
          <div className="mb-4">
            <input 
              type="text" 
              placeholder="Token QR Code" 
              style={{ width: '100%', padding: '1rem', border: '1px solid #f1f5f9', borderRadius: '8px', textAlign: 'center', backgroundColor: '#f8fafc', outline: 'none', color: 'var(--text-light)', fontWeight: '500' }} 
            />
          </div>
          
          <button className="btn-primary" style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', borderRadius: '8px' }}>
            Submit Absen
          </button>
        </div>
      )}

      <div>
        <h3 className="font-bold text-primary-dark mb-4 text-lg">Riwayat Absensi</h3>
        <div className="card flex items-center justify-between" style={{ padding: '1rem' }}>
          <div className="flex items-center gap-3">
            <div style={{ backgroundColor: 'var(--danger-bg)', padding: '0.5rem', borderRadius: '50%', color: 'var(--danger)' }}>
              <XCircle size={20} />
            </div>
            <div>
              <p className="font-bold text-primary-dark text-sm">Oreantasi PKS</p>
              <p className="text-xs text-light">15 Sep 2026</p>
            </div>
          </div>
          <div className="status-badge red">Tidak Hadir</div>
        </div>
      </div>
    </div>
  );
};

export default Absen;
