import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, ClipboardList, Star, QrCode, Calendar, Clock, MapPin, Home, User, BookOpen, X, ChevronRight, BookOpenCheck, Coffee } from 'lucide-react';
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

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    todayAttendance: false,
    pendingTasks: 0,
    pendingEvaluations: 0,
    trainee: JSON.parse(localStorage.getItem('trainee_data') || '{"name":"","program":""}'),
    todayClass: null,
    classInfo: null
  });
  const [loading, setLoading] = useState(true);
  const [showCertBanner, setShowCertBanner] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/trainee/dashboard');
        setData(response.data.data || response.data);
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('trainee_data');
          navigate('/login');
        }
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [navigate]);

  const handleDownloadCertificate = async () => {
    try {
      const response = await api.get('/api/trainee/certificate', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Sertifikat_${data.trainee?.name || 'Kelulusan'}.pdf`);
      document.body.appendChild(link);
      link.click();
      setTimeout(() => { link.remove(); window.URL.revokeObjectURL(url); }, 100);
    } catch (error) {
      alert(error.message || 'Gagal mengunduh sertifikat.');
    }
  };

  const hasActiveSchedule = data.classInfo && data.classInfo.id;

  return (
    <div style={{ paddingBottom: '90px', backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      {/* PREMIUM HEADER */}
      <div style={{
        background: 'linear-gradient(135deg, #0d3829 0%, #175e47 50%, #0d3829 100%)',
        position: 'relative',
        overflow: 'hidden',
        color: 'white',
        padding: '1rem 1.5rem 5.5rem', // Dikurangi lagi padding atasnya agar logo lebih naik, padding bawah ditambah
        borderBottomLeftRadius: '32px',
        borderBottomRightRadius: '32px',
        boxShadow: '0 10px 30px rgba(13, 56, 41, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        gap: '1.25rem', // Jarak pas dan konsisten antara logo dan teks
        minHeight: '280px' // Tinggi minimal yang proporsional
      }}>
        {/* Radial Glow */}
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(134,209,111,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        
        {/* Decorative Leaves */}
        <BotanicalLeaf style={{ position: 'absolute', top: '-10%', right: '-10%', width: '350px', height: '350px', color: '#114b3d', opacity: 0.4, transform: 'rotate(15deg)', pointerEvents: 'none' }} />
        <BotanicalLeaf style={{ position: 'absolute', bottom: '-20%', right: '10%', width: '250px', height: '250px', color: '#1a6a51', opacity: 0.3, transform: 'rotate(-45deg)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2 }}>
          <div className="dashboard-mobile-logo" style={{
            backgroundColor: 'white',
            padding: '3px', // Diperkecil bordernya
            borderRadius: '0', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img 
              src="/logo.png" 
              alt="First Resources Logo" 
              style={{ width: '44px', height: 'auto', objectFit: 'contain', display: 'block' }} 
            />
          </div>
          <Link to="/profil" style={{ textDecoration: 'none', marginLeft: 'auto' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              backgroundColor: 'white', color: '#0d3829',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid #86d16f',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}>
              <User size={24} strokeWidth={2.5} />
            </div>
          </Link>
        </div>

        <div style={{ position: 'relative', zIndex: 2 }}>
          <p style={{ fontSize: '0.9rem', marginBottom: '0.2rem', color: '#e2e8f0' }}>Selamat datang,</p>
          <h1 style={{ 
            fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.75rem', 
            lineHeight: '1.2', letterSpacing: '-0.5px',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
          }}>
            {loading ? 'Memuat...' : (data.trainee?.name || 'Nama Peserta')}
          </h1>
          
          <div style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            backgroundColor: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: '24px',
            backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#86d16f', borderRadius: '50%', boxShadow: '0 0 8px #86d16f' }}></div>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.5px' }}>
              {loading ? '...' : (data.todayClass || 'Peserta Pelatihan')}
            </span>
          </div>
        </div>
      </div>

      {/* CARDS CONTAINER */}
      <div className="dashboard-cards-grid" style={{ marginTop: '-3.5rem', padding: '0 1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', zIndex: 3 }}>
        
        {/* CERTIFICATE BANNER */}
        {showCertBanner && data.classInfo && Boolean(data.classInfo.is_passed) && (
          <div className="dashboard-full-width-card" style={{
            backgroundColor: '#ecfdf5', border: '1px solid #10b981', borderRadius: '20px', padding: '1.25rem',
            position: 'relative', boxShadow: '0 8px 24px rgba(16, 185, 129, 0.1)'
          }}>
            <button onClick={() => setShowCertBanner(false)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: '#059669', cursor: 'pointer' }}>
              <X size={18} />
            </button>
            <p style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#047857', marginBottom: '1rem', paddingRight: '20px' }}>
              🎉 Selamat! Anda telah lulus pelatihan ini.
            </p>
            <button onClick={handleDownloadCertificate} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#10b981', color: 'white', border: 'none', padding: '0.875rem', borderRadius: '12px', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}>
              <BookOpen size={20} />
              Unduh Sertifikat Kelulusan
            </button>
          </div>
        )}

        {/* ABSENSI CARD */}
        <div style={{ 
          backgroundColor: 'white', borderRadius: '20px', padding: '1.5rem', 
          border: '1px solid #f1f5f9', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center',
          boxShadow: '0 8px 24px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden'
        }}>
          {/* Decorative Mint Background */}
          <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '40%', background: 'linear-gradient(to left, #ecfdf5, transparent)', opacity: 0.7, borderRadius: '0 20px 20px 0', pointerEvents: 'none' }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 1 }}>
             <div style={{ backgroundColor: '#e8fcf1', padding: '12px', borderRadius: '50%', color: '#047857', border: '1px solid #d1fae5' }}>
               <CheckCircle size={32} strokeWidth={2.5} />
             </div>
             <div>
               <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '2px', fontWeight: '500' }}>Absensi Hari Ini</p>
               <p style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f4a38' }}>
                 {loading ? '...' : (data.todayAttendance ? 'Sudah Absen' : 'Belum Absen')}
               </p>
             </div>
          </div>
          {!data.todayAttendance && (
            <Link to="/absen" style={{ 
              backgroundColor: '#f43f5e', color: 'white', textDecoration: 'none', position: 'relative', zIndex: 1,
              padding: '0.6rem 1.25rem', borderRadius: '12px', fontWeight: '700', fontSize: '0.9rem',
              boxShadow: '0 4px 12px rgba(244, 63, 94, 0.25)', display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              <QrCode size={18} strokeWidth={2.5} />
              Scan QR
            </Link>
          )}
        </div>

        {/* TUGAS CARD */}
        <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #f1f5f9', boxShadow: '0 8px 24px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, bottom: '50%', width: '40%', background: 'radial-gradient(ellipse at top right, #fff7ed, transparent)', opacity: 0.8, pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', position: 'relative', zIndex: 1 }}>
            <div style={{ backgroundColor: '#fffbeb', padding: '12px', borderRadius: '16px', color: '#d97706' }}>
              <ClipboardList size={32} strokeWidth={2.5} />
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '2px', fontWeight: '500' }}>Tugas Menunggu</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f4a38' }}>{loading ? '...' : data.pendingTasks}</span>
                <span style={{ fontSize: '0.9rem', color: '#334155', fontWeight: '600' }}>tugas</span>
              </div>
            </div>
          </div>
          <Link to="/tugas" style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', 
            textDecoration: 'none', color: '#0f4a38', padding: '1rem 1.25rem', borderRadius: '12px', position: 'relative', zIndex: 1
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ClipboardList size={20} color="#047857" strokeWidth={2.5} />
              <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>Lihat Semua Tugas</span>
            </div>
            <ChevronRight size={20} color="#94a3b8" />
          </Link>
        </div>

        {/* EVALUASI CARD */}
        <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #f1f5f9', boxShadow: '0 8px 24px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, bottom: '50%', width: '40%', background: 'radial-gradient(ellipse at top right, #eff6ff, transparent)', opacity: 0.8, pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', position: 'relative', zIndex: 1 }}>
            <div style={{ backgroundColor: '#eff6ff', padding: '12px', borderRadius: '16px', color: '#3b82f6' }}>
              <Star size={32} strokeWidth={2.5} />
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '2px', fontWeight: '500' }}>Evaluasi Menunggu</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f4a38' }}>{loading ? '...' : (data.pendingEvaluations || 0)}</span>
                <span style={{ fontSize: '0.9rem', color: '#334155', fontWeight: '600' }}>materi</span>
              </div>
            </div>
          </div>
          <Link to="/evaluasi" style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', 
            textDecoration: 'none', color: '#0f4a38', padding: '1rem 1.25rem', borderRadius: '12px', position: 'relative', zIndex: 1
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Star size={20} color="#0369a1" strokeWidth={2.5} />
              <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>Mulai Evaluasi</span>
            </div>
            <ChevronRight size={20} color="#94a3b8" />
          </Link>
        </div>

        {/* SCHEDULE CARD */}
        {!hasActiveSchedule ? (
          <div className="dashboard-full-width-card" style={{ 
            background: 'linear-gradient(135deg, #0d3829 0%, #175e47 100%)', borderRadius: '20px', padding: '1.5rem', color: 'white',
            display: 'flex', alignItems: 'center', gap: '1.25rem', boxShadow: '0 8px 24px rgba(13, 56, 41, 0.15)', position: 'relative', overflow: 'hidden'
          }}>
            <BotanicalLeaf style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '150px', height: '150px', color: '#86d16f', opacity: 0.1, transform: 'rotate(-30deg)', pointerEvents: 'none' }} />
            <BookOpenCheck size={48} color="#86d16f" strokeWidth={1.5} style={{ position: 'relative', zIndex: 1 }} />
            <div style={{ width: '1px', height: '50px', backgroundColor: 'rgba(255,255,255,0.2)', position: 'relative', zIndex: 1 }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{ color: '#e8fcf1', fontWeight: '800', fontSize: '1.1rem', marginBottom: '4px' }}>Jadwal Training Tidak Aktif</h3>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.9)' }}>Saat ini belum ada jadwal kelas yang aktif.</p>
            </div>
          </div>
        ) : (
          <div className="dashboard-full-width-card" style={{ 
            background: 'linear-gradient(135deg, #0d3829 0%, #175e47 100%)', borderRadius: '20px', padding: '1.5rem', color: 'white',
            boxShadow: '0 8px 24px rgba(13, 56, 41, 0.15)', position: 'relative', overflow: 'hidden'
          }}>
            <BotanicalLeaf style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '200px', height: '200px', color: '#86d16f', opacity: 0.1, transform: 'rotate(-45deg)', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
              <BookOpenCheck size={40} color="#86d16f" strokeWidth={1.5} />
              <div style={{ width: '1px', height: '40px', backgroundColor: 'rgba(255,255,255,0.2)' }} />
              <div>
                <h3 style={{ color: '#e8fcf1', fontWeight: '800', fontSize: '1.1rem', marginBottom: '2px' }}>Jadwal Training Aktif</h3>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.9)' }}>Detail jadwal kelas Anda saat ini.</p>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', gridColumn: '1 / -1' }}>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '12px' }}>
                  <Calendar size={18} color="#86d16f" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7, marginBottom: '2px' }}>Tanggal</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>
                    {data.classInfo.date ? new Date(data.classInfo.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'} 
                    {data.classInfo.end_date && data.classInfo.end_date !== data.classInfo.date ? ` - ${new Date(data.classInfo.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '12px' }}>
                  <Clock size={18} color="#86d16f" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7, marginBottom: '2px' }}>Waktu</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>
                    {data.classInfo.start_time ? data.classInfo.start_time.substring(0,5) : '-'} {data.classInfo.end_time ? `- ${data.classInfo.end_time.substring(0,5)}` : ''}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '12px' }}>
                  <MapPin size={18} color="#86d16f" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7, marginBottom: '2px' }}>Lokasi</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>FR Academy</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '12px' }}>
                  <Home size={18} color="#86d16f" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7, marginBottom: '2px' }}>Ruangan</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>
                    {data.classInfo.room ? data.classInfo.room.replace(/^FR Academy\s*\/\s*/i, '') : 'TBA'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '12px' }}>
                  <User size={18} color="#86d16f" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7, marginBottom: '2px' }}>Instruktur</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>
                    {data.classInfo.trainer_name || 'TBA'}
                  </span>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem', position: 'relative', zIndex: 1 }}>
              {/* LMS Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.9)', lineHeight: '1.5', margin: 0 }}>
                  Akses materi dan modul pelatihan silahkan cek di LMS FR Academy.
                </p>
                <a 
                  href={data.classInfo.lms_url || "https://e-learning.first-resources.com/"} 
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    backgroundColor: '#86d16f', color: '#0d3829', padding: '0.875rem', borderRadius: '12px',
                    textDecoration: 'none', fontWeight: '800', boxShadow: '0 4px 12px rgba(134, 209, 111, 0.3)',
                    width: '100%'
                  }}
                >
                  <BookOpen size={20} strokeWidth={2.5} />
                  LMS FR Academy
                </a>
              </div>

              {/* Mess Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.9)', lineHeight: '1.5', margin: 0 }}>
                  Butuh penginapan selama masa pelatihan? Anda dapat melihat informasi melalui portal resmi Mess FR Academy.
                </p>
                <a 
                  href={data.classInfo.mess_url || "https://mess-fr-academy.my.id"} 
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    backgroundColor: 'white', color: '#0d3829', padding: '0.875rem', borderRadius: '12px',
                    textDecoration: 'none', fontWeight: '800', border: '2px solid #86d16f',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    width: '100%'
                  }}
                >
                  <Home size={20} strokeWidth={2.5} />
                  Mess FR Academy
                </a>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;


