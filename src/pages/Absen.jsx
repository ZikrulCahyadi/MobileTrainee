import React, { useState, useEffect } from 'react';
import { Camera, Upload, XCircle, QrCode, CheckCircle, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import api from '../utils/api';

const Absen = () => {
  const [activeTab, setActiveTab] = useState('scan');
  const [isScanning, setIsScanning] = useState(false);
  const [token, setToken] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [attendances, setAttendances] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await api.get('/trainee/attendances');
      setAttendances(response.data.data || response.data || []);
    } catch (error) {
      console.error("Error fetching attendances", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    let html5QrCode = null;
    
    if (activeTab === 'scan' && isScanning) {
      html5QrCode = new Html5Qrcode("qr-reader");
      
      html5QrCode.start(
        { facingMode: "environment" }, // Pakai kamera belakang
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          setIsScanning(false);
          html5QrCode.stop().catch(console.error);
          
          setFeedback({ type: 'loading', text: 'Memverifikasi data absensi Anda, mohon tunggu sebentar...' });
          
          setTimeout(() => {
            // Submit otomatis
            api.post('/trainee/submit-attendance', {
                qr_token: decodedText.trim()
            }).then(response => {
                setFeedback({ type: 'success', text: response.data.message || 'Absensi berhasil! Anda tercatat hadir.' });
                fetchHistory();
            }).catch(err => {
                let debugMsg = 'Tidak ada respon dari server.';
                if (err.response && err.response.data) {
                    debugMsg = err.response.data.message || err.response.data.error || (typeof err.response.data === 'object' ? JSON.stringify(err.response.data) : err.response.data);
                }
                setFeedback({ type: 'error', text: debugMsg });
            });
          }, 2000);
        },
        (error) => {
          // Abaikan error per frame (misal QR belum ketemu)
        }
      ).catch((err) => {
        console.error("Camera start error", err);
        setFeedback({ 
          type: 'error', 
          text: 'Kamera tidak dapat diakses. Pastikan Anda telah memberikan izin kamera pada browser/aplikasi Anda.' 
        });
        setIsScanning(false);
      });
    }

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [activeTab, isScanning]);

  const handleSubmitAbsen = async () => {
    if (!token) return setFeedback({ type: 'error', text: 'Silakan masukkan token QR Code!' });
    try {
        const response = await api.post('/trainee/submit-attendance', {
            qr_token: token.trim()
        });
        setFeedback({ type: 'success', text: response.data.message || 'Absensi berhasil! Anda tercatat hadir.' });
        setToken('');
        fetchHistory();
    } catch (err) {
        let debugMsg = 'Tidak ada respon dari server.';
        if (err.response && err.response.data) {
            debugMsg = err.response.data.message || err.response.data.error || (typeof err.response.data === 'object' ? JSON.stringify(err.response.data) : err.response.data);
        }
        setFeedback({ type: 'error', text: debugMsg });
    }
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
            <label style={{ background: 'transparent', border: 'none', color: 'var(--primary-dark)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
              <Upload size={18} />
              <span style={{ textDecoration: 'underline' }}>Scan dari file gambar</span>
              <input 
                type="file" 
                accept="image/*" 
                style={{ display: 'none' }}
                onChange={async (e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    const file = e.target.files[0];
                    try {
                      const html5QrCode = new Html5Qrcode("file-qr-reader");
                      const decodedText = await html5QrCode.scanFileV2(file);
                      const text = decodedText.decodedText || decodedText;
                      
                      // Submit otomatis
                      setFeedback({ type: 'loading', text: 'Memverifikasi data absensi dari gambar...' });
                      setTimeout(async () => {
                        try {
                          const response = await api.post('/trainee/submit-attendance', {
                              qr_token: text.trim()
                          });
                          setFeedback({ type: 'success', text: response.data.message || 'Absensi berhasil! Anda tercatat hadir.' });
                          fetchHistory();
                        } catch (err) {
                          let debugMsg = 'Tidak ada respon dari server.';
                          if (err.response && err.response.data) {
                              debugMsg = err.response.data.message || err.response.data.error || (typeof err.response.data === 'object' ? JSON.stringify(err.response.data) : err.response.data);
                          }
                          setFeedback({ type: 'error', text: debugMsg });
                        }
                      }, 2000);
                    } catch (err) {
                      setFeedback({ type: 'error', text: 'QR Code tidak ditemukan atau gambar kurang jelas.' });
                    }
                  }
                }}
              />
            </label>
          )}
          <div id="file-qr-reader" style={{ display: 'none' }}></div>

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

      <div style={{ paddingBottom: '2rem' }}>
        <h3 className="font-bold text-primary-dark mb-4 text-lg">Riwayat Absensi</h3>
        
        {loadingHistory ? (
           <p className="text-center text-light">Memuat riwayat...</p>
        ) : attendances.filter(a => a.status !== 'Belum').length === 0 ? (
           <div className="card text-center text-light py-6">Belum ada riwayat absensi.</div>
        ) : (
           attendances.filter(a => a.status !== 'Belum').map((item, idx) => (
             <div key={item.id || idx} className="card flex items-center justify-between mb-3" style={{ padding: '1rem' }}>
               <div className="flex items-center gap-3">
                 <div style={{ backgroundColor: item.status === 'Hadir' || item.status === 'Present' || !item.status ? '#dcfce3' : 'var(--danger-bg)', padding: '0.5rem', borderRadius: '50%', color: item.status === 'Hadir' || item.status === 'Present' || !item.status ? '#10b981' : 'var(--danger)' }}>
                   {item.status === 'Hadir' || item.status === 'Present' || !item.status ? <CheckCircle size={20} /> : <XCircle size={20} />}
                 </div>
                 <div>
                   <p className="font-bold text-primary-dark text-sm">{item.session || item.classInfo?.title || item.title || 'Sesi Pelatihan'}</p>
                   <p className="text-xs text-light">{item.date_formatted || item.date || 'Tanggal tidak diketahui'}</p>
                 </div>
               </div>
               <div className={`status-badge ${item.status === 'Hadir' || item.status === 'Present' || !item.status ? 'green' : 'red'}`} style={{ backgroundColor: item.status === 'Hadir' || item.status === 'Present' || !item.status ? '#dcfce3' : '#fee2e2', color: item.status === 'Hadir' || item.status === 'Present' || !item.status ? '#047857' : '#b91c1c' }}>
                 {item.status || 'Hadir'}
               </div>
             </div>
           ))
        )}
      </div>

      {/* Feedback Modal Popup */}
      {feedback && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1.5rem', backdropFilter: 'blur(2px)'
        }}>
          <div className="card" style={{ 
            width: '100%', maxWidth: '340px', padding: '2rem 1.5rem', 
            textAlign: 'center', borderRadius: '16px', backgroundColor: '#fff',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%', margin: '0 auto 1.25rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: feedback.type === 'success' ? '#dcfce3' : feedback.type === 'loading' ? '#e0f2fe' : '#fee2e2',
              color: feedback.type === 'success' ? '#10b981' : feedback.type === 'loading' ? '#0284c7' : '#ef4444'
            }}>
              {feedback.type === 'success' ? <CheckCircle size={36} /> : feedback.type === 'loading' ? <Loader2 size={36} className="animate-spin" /> : <AlertCircle size={36} />}
            </div>
            
            <h3 className="font-bold text-xl mb-3" style={{ color: 'var(--primary-dark)' }}>
              {feedback.type === 'success' ? 'Berhasil!' : feedback.type === 'loading' ? 'Memproses...' : 'Gagal'}
            </h3>
            <p className="text-sm text-light mb-6" style={{ lineHeight: '1.6' }}>
              {feedback.text}
            </p>
            
            {feedback.type !== 'loading' && (
              <button 
                style={{ 
                  display: 'block',
                  width: '100%', padding: '0.875rem', borderRadius: '10px', 
                  fontWeight: 'bold', border: 'none', cursor: 'pointer',
                  backgroundColor: feedback.type === 'success' ? '#047857' : '#ef4444',
                  color: '#ffffff',
                  marginTop: '0.5rem'
                }}
                onClick={() => setFeedback(null)}
              >
                Tutup
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Absen;

