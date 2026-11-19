import React, { useState, useEffect } from 'react';
import { Camera, XCircle, QrCode, CheckCircle, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../utils/api';

const INDO_MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const formatAttendanceDate = (rawDate) => {
  if (!rawDate) return '-';
  try {
    const str = String(rawDate).trim();
    const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const year = match[1];
      const monthIdx = parseInt(match[2], 10) - 1;
      const day = parseInt(match[3], 10);
      const mStr = INDO_MONTHS_SHORT[monthIdx] || match[2];
      return `${day} ${mStr} ${year}`;
    }
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      const day = d.getDate();
      const mStr = INDO_MONTHS_SHORT[d.getMonth()];
      const year = d.getFullYear();
      return `${day} ${mStr} ${year}`;
    }
    return str;
  } catch (e) {
    return String(rawDate);
  }
};

const getAttendanceStatusConfig = (rawStatus) => {
  const status = String(rawStatus || '').trim().toLowerCase();
  if (status === 'hadir') {
    return {
      text: 'Hadir',
      textColor: '#047857',
      badgeBg: '#DCFCE7',
      iconBg: '#DCFCE7',
      iconColor: '#16A34A',
      IconComponent: CheckCircle
    };
  }
  if (['tidak_hadir', 'tidak hadir', 'alpha', 'absen'].includes(status)) {
    return {
      text: 'Tidak Hadir',
      textColor: '#DC2626',
      badgeBg: '#FEE2E2',
      iconBg: '#FEE2E2',
      iconColor: '#EF4444',
      IconComponent: AlertCircle
    };
  }
  if (['izin', 'sakit'].includes(status)) {
    return {
      text: status === 'izin' ? 'Izin' : 'Sakit',
      textColor: '#D97706',
      badgeBg: '#FEF3C7',
      iconBg: '#FEF3C7',
      iconColor: '#D97706',
      IconComponent: Clock
    };
  }
  return {
    text: 'Belum Hadir',
    textColor: '#D97706',
    badgeBg: '#FEF3C7',
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
    IconComponent: Clock
  };
};

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
    let isProcessingScan = false;
    
    if (activeTab === 'scan' && isScanning) {
      html5QrCode = new Html5Qrcode("qr-reader");
      
      html5QrCode.start(
        { facingMode: "environment" }, // Pakai kamera belakang
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          if (isProcessingScan) return;
          isProcessingScan = true;

          // Hentikan scanner segera
          try {
            await html5QrCode.stop();
          } catch (e) {
            console.error(e);
          }
          setIsScanning(false);
          setFeedback({ type: 'loading', text: 'Memverifikasi absensi Anda...' });

          // Submit langsung tanpa delay
          try {
            const response = await api.post('/trainee/submit-attendance', {
                qr_token: decodedText.trim(),
                qr_code: decodedText.trim()
            });
            localStorage.setItem('attended_today', 'true');
            setFeedback({ type: 'success', text: response.data.message || 'Absensi berhasil! Anda tercatat hadir.' });
            fetchHistory();
          } catch (err) {
            let debugMsg = 'Tidak ada respon dari server.';
            if (err.response && err.response.data) {
                debugMsg = err.response.data.message || err.response.data.error || (typeof err.response.data === 'object' ? JSON.stringify(err.response.data) : err.response.data);
            }
            setFeedback({ type: 'error', text: debugMsg });
          }
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
    
    setFeedback({ type: 'loading', text: 'Memverifikasi token absensi manual Anda...' });
    
    try {
      const response = await api.post('/trainee/submit-attendance', {
          qr_token: token.trim(),
          qr_code: token.trim()
      });
      localStorage.setItem('attended_today', 'true');
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
    <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', paddingBottom: '36px' }}>
      {/* PALM GREEN HEADER */}
      <div style={{
        background: 'linear-gradient(135deg, #0d3829 0%, #175e47 50%, #0d3829 100%)',
        position: 'relative',
        overflow: 'hidden',
        color: 'white',
        padding: '2.5rem 1.25rem 3.5rem',
        borderBottomLeftRadius: '28px',
        borderBottomRightRadius: '28px',
        boxShadow: '0 8px 24px rgba(13, 56, 41, 0.15)'
      }}>
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#ffffff' }}>
          Absensi Pelatihan
        </h1>
        <p style={{ fontSize: '13px', color: '#D1FAE5', margin: 0 }}>
          Presensi kehadiran kelas hari ini
        </p>
      </div>

      {/* OVERLAPPING CONTENT CONTAINER */}
      <div style={{ marginTop: '-1.75rem', padding: '0 16px', position: 'relative', zIndex: 2 }}>
        {/* SEGMENTED TAB SWITCHER */}
        <div style={{
          height: '48px',
          backgroundColor: '#EEF2F6',
          borderRadius: '14px',
          padding: '4px',
          display: 'flex',
          marginBottom: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <button 
            type="button"
            style={{
              flex: 1,
              height: '100%',
              border: 'none',
              borderRadius: '10px',
              backgroundColor: activeTab === 'scan' ? '#0D3829' : 'transparent',
              color: activeTab === 'scan' ? '#FFFFFF' : '#64748B',
              fontSize: '13px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={() => {
              setActiveTab('scan');
              setIsScanning(false);
            }}
          >
            Scan Kamera
          </button>
          <button 
            type="button"
            style={{
              flex: 1,
              height: '100%',
              border: 'none',
              borderRadius: '10px',
              backgroundColor: activeTab === 'manual' ? '#0D3829' : 'transparent',
              color: activeTab === 'manual' ? '#FFFFFF' : '#64748B',
              fontSize: '13px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={() => {
              setActiveTab('manual');
              setIsScanning(false);
            }}
          >
            Input Manual
          </button>
        </div>

        {/* SCANNER / MANUAL CARD */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #F1F5F9',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          padding: '20px',
          marginBottom: '24px'
        }}>
          {activeTab === 'scan' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {isScanning ? (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div id="qr-reader" style={{ width: '100%', maxWidth: '380px', overflow: 'hidden', borderRadius: '12px' }}></div>
                  <button 
                    type="button"
                    style={{
                      marginTop: '16px',
                      height: '44px',
                      padding: '0 20px',
                      backgroundColor: 'transparent',
                      border: '1px solid #F43F5E',
                      color: '#F43F5E',
                      borderRadius: '12px',
                      fontWeight: 'bold',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                    onClick={() => setIsScanning(false)}
                  >
                    Batal Scan
                  </button>
                </div>
              ) : (
                <div style={{
                  width: '100%',
                  height: '220px',
                  backgroundColor: '#F8FAFC',
                  border: '2px dashed #CBD5E1',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px',
                  boxSizing: 'border-box'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: '#E8FCF1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px'
                  }}>
                    <Camera size={32} color="#0D3829" strokeWidth={2.2} />
                  </div>
                  <button 
                    type="button"
                    style={{
                      backgroundColor: '#0D3829',
                      color: '#FFFFFF',
                      height: '48px',
                      padding: '0 24px',
                      borderRadius: '12px',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(13, 56, 41, 0.2)'
                    }}
                    onClick={() => setIsScanning(true)}
                  >
                    Aktifkan Kamera
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'manual' && (
            <div style={{ paddingTop: '8px', paddingBottom: '8px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#0F4A38', margin: '0 0 2px 0' }}>
                Masukkan Token QR Absensi
              </h4>
              <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 14px 0' }}>
                Ketik kode token presensi dari Trainer
              </p>
              
              <input 
                type="text" 
                placeholder="Contoh: TRN-2026-XYZ" 
                value={token}
                onChange={(e) => setToken(e.target.value)}
                style={{
                  width: '100%',
                  height: '50px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: '12px',
                  padding: '0 16px',
                  color: '#1E293B',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }} 
              />
              
              <button 
                type="button"
                style={{
                  width: '100%',
                  height: '50px',
                  marginTop: '14px',
                  backgroundColor: '#0D3829',
                  color: '#FFFFFF',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(13, 56, 41, 0.2)',
                  opacity: feedback?.type === 'loading' ? 0.7 : 1
                }} 
                onClick={handleSubmitAbsen}
                disabled={feedback?.type === 'loading'}
              >
                {feedback?.type === 'loading' ? 'Memverifikasi...' : 'Kirim Absensi'}
              </button>
            </div>
          )}
        </div>

        {/* SECTION: RIWAYAT ABSENSI */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0F4A38', marginBottom: '12px' }}>
            Riwayat Absensi
          </h3>
          
          {loadingHistory ? (
            <p style={{ textAlign: 'center', color: '#64748B', fontSize: '14px', padding: '1rem 0' }}>Memuat riwayat...</p>
          ) : attendances.filter(a => a.status !== 'Belum').length === 0 ? (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #F1F5F9',
              padding: '2rem 1rem',
              textAlign: 'center',
              color: '#64748B',
              fontSize: '14px'
            }}>
              Belum ada riwayat presensi.
            </div>
          ) : (
            attendances.filter(a => a.status !== 'Belum').map((item, idx) => {
              const cfg = getAttendanceStatusConfig(item.status);
              const Icon = cfg.IconComponent;
              return (
                <div key={item.id || idx} style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #F1F5F9',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  padding: '16px',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: cfg.iconBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: cfg.iconColor,
                      flexShrink: 0
                    }}>
                      <Icon size={22} color={cfg.iconColor} strokeWidth={2.2} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#0F4A38',
                        margin: '0 0 2px 0',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {item.session || item.classInfo?.title || item.title || 'Sesi Pelatihan'}
                      </p>
                      <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                        {formatAttendanceDate(item.date || item.attended_at || item.created_at || item.date_formatted)}
                      </p>
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: cfg.badgeBg,
                    color: cfg.textColor,
                    padding: '5px 12px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    flexShrink: 0,
                    marginLeft: '8px'
                  }}>
                    {cfg.text}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Feedback Modal Popup */}
      {feedback && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1.5rem', backdropFilter: 'blur(2px)'
        }}>
          {feedback.type === 'loading' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <style>{`
                @keyframes muter {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
              `}</style>
              <div style={{ animation: 'muter 1s linear infinite', color: '#fff' }}>
                <Loader2 size={64} strokeWidth={2.5} />
              </div>
            </div>
          ) : (
            <div className="card" style={{ 
              width: '100%', maxWidth: '340px', padding: '2rem 1.5rem', 
              textAlign: 'center', borderRadius: '16px', backgroundColor: '#fff',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%', margin: '0 auto 1.25rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: feedback.type === 'success' ? '#dcfce3' : '#fee2e2',
                color: feedback.type === 'success' ? '#10b981' : '#ef4444'
              }}>
                {feedback.type === 'success' ? <CheckCircle size={36} /> : <AlertCircle size={36} />}
              </div>
              
              <h3 className="font-bold text-xl mb-3" style={{ color: 'var(--primary-dark)' }}>
                {feedback.type === 'success' ? 'Berhasil!' : 'Gagal'}
              </h3>
              <p className="text-sm text-light mb-6" style={{ lineHeight: '1.6' }}>
                {feedback.text}
              </p>
              
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
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Absen;

