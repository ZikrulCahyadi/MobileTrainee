import React, { useState, useEffect } from 'react';
import { Camera, Upload, XCircle, QrCode } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const Absen = () => {
  const [activeTab, setActiveTab] = useState('scan');
  const [isScanning, setIsScanning] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    let scanner = null;
    
    if (activeTab === 'scan' && isScanning) {
      scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );
      
      scanner.render(
        (decodedText) => {
          setToken(decodedText);
          setIsScanning(false);
          setActiveTab('manual');
          if (scanner) {
            scanner.clear().catch(console.error);
          }
        },
        (error) => {
          // ignore scan failures
        }
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [activeTab, isScanning]);

  const handleSubmitAbsen = () => {
    if (!token) return alert('Silakan masukkan token QR Code!');
    alert('Token berhasil diinput: ' + token + '\n\nFitur submit ke backend (API presensi) masih menunggu implementasi dari backend.');
  };

  return (
    <div className="p-4">
      <div className="card mb-4">
        <h2 className="text-xl font-bold text-primary-dark mb-1">Absensi Training</h2>
        <p className="text-sm text-light">Lakukan presensi dengan memindai QR Code dari Trainer.</p>
      </div>

      <div className="tab-container">
        <button 
          className={`tab-button ${activeTab === 'scan' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('scan');
            setIsScanning(false);
          }}
        >
          Scan Kamera
        </button>
        <button 
          className={`tab-button ${activeTab === 'manual' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('manual');
            setIsScanning(false);
          }}
        >
          Input Manual
        </button>
      </div>

      {activeTab === 'scan' && (
        <div className="card mb-6" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem' }}>
          
          {isScanning ? (
            <div id="qr-reader" style={{ width: '100%', maxWidth: '400px', marginBottom: '1.5rem', overflow: 'hidden', borderRadius: '12px' }}></div>
          ) : (
            <div style={{ width: '100%', height: '240px', border: '2px dashed #cbd5e1', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', backgroundColor: '#f8fafc' }}>
              <div style={{ backgroundColor: '#ecfccb', padding: '1rem', borderRadius: '50%', color: 'var(--primary-dark)', marginBottom: '1rem' }}>
                <Camera size={32} />
              </div>
              <button className="btn-primary" style={{ width: 'auto', padding: '0.75rem 2rem' }} onClick={() => setIsScanning(true)}>
                Aktifkan Kamera
              </button>
            </div>
          )}

          {!isScanning && (
            <button style={{ background: 'transparent', border: 'none', color: 'var(--primary-dark)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
              <Upload size={18} />
              <span style={{ textDecoration: 'underline' }}>Scan dari file gambar</span>
            </button>
          )}

          {isScanning && (
            <button className="btn-outline-danger" onClick={() => setIsScanning(false)}>
               Batal Scan
            </button>
          )}
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
              value={token}
              onChange={(e) => setToken(e.target.value)}
              style={{ width: '100%', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', textAlign: 'center', backgroundColor: '#f8fafc', outline: 'none', color: 'var(--text-dark)', fontWeight: '600' }} 
            />
          </div>
          
          <button className="btn-primary" style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', borderRadius: '8px' }} onClick={handleSubmitAbsen}>
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
