import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, ClipboardList, Star, QrCode, Calendar, Clock, MapPin, Home, User, BookOpen, ChevronRight, BookOpenCheck, X } from 'lucide-react';
import api from '../utils/api';
import logoImg from '../assets/logo.png';

const INDO_MONTHS = {
  'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'mei': 4, 'may': 4,
  'jun': 5, 'jul': 6, 'agu': 7, 'aug': 7, 'sep': 8, 'okt': 9, 'oct': 9,
  'nov': 10, 'des': 11, 'dec': 11
};

const parseDateSafe = (rawDate) => {
  if (!rawDate || String(rawDate).trim().toLowerCase() === 'hari ini') return null;
  const str = String(rawDate).trim();

  // Try standard parse first (ISO, YYYY-MM-DD, etc.)
  const direct = new Date(str);
  if (!isNaN(direct.getTime()) && str.includes('-')) {
    return direct;
  }

  // Handle format like "19 Agu 2026", "19 Agustus 2026", etc.
  const match = str.match(/^(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})/);
  if (match) {
    const day = parseInt(match[1], 10);
    const mStr = match[2].toLowerCase().substring(0, 3);
    const year = parseInt(match[3], 10);
    if (INDO_MONTHS[mStr] !== undefined) {
      return new Date(year, INDO_MONTHS[mStr], day);
    }
  }

  return isNaN(direct.getTime()) ? null : direct;
};

const formatDisplayDate = (rawDate) => {
  if (!rawDate || String(rawDate).trim().toLowerCase() === 'hari ini') return 'Hari Ini';
  const d = parseDateSafe(rawDate);
  if (!d) return rawDate;
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatDisplayDateRange = (startDateRaw, endDateRaw) => {
  if (!startDateRaw) return endDateRaw ? formatDisplayDate(endDateRaw) : 'Hari Ini';
  const startFmt = formatDisplayDate(startDateRaw);
  if (!endDateRaw || endDateRaw === startDateRaw) return startFmt;
  const endFmt = formatDisplayDate(endDateRaw);
  return `${startFmt} - ${endFmt}`;
};

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
  const cachedTrainee = JSON.parse(localStorage.getItem('trainee_data') || 'null');
  const cachedClass = JSON.parse(localStorage.getItem('class_info') || 'null');
  const cachedAttended = localStorage.getItem('attended_today') === 'true';

  const [data, setData] = useState({
    todayAttendance: cachedAttended,
    pendingTasks: 0,
    pendingEvaluations: 0,
    trainee: cachedTrainee || { name: '', program: '' },
    todayClass: null,
    classInfo: cachedClass
  });
  const [loading, setLoading] = useState(!cachedTrainee?.name);
  const [showCertBanner, setShowCertBanner] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboard = async (isBackground = false) => {
      try {
        const [dashResult, evalResult] = await Promise.allSettled([
          api.get('/trainee/dashboard'),
          api.get('/trainee/evaluations/pending')
        ]);

        if (!isMounted) return;

        if (dashResult.status === 'fulfilled') {
          const response = dashResult.value;
          let dashboardData = response.data.data || response.data || {};
          
          if (evalResult.status === 'fulfilled') {
            const evalData = evalResult.value.data.data || evalResult.value.data || [];
            dashboardData.pendingEvaluations = Array.isArray(evalData) ? evalData.length : 0;
          }

          if (dashboardData.todayAttendance !== undefined) {
            localStorage.setItem('attended_today', dashboardData.todayAttendance ? 'true' : 'false');
          }
          if (dashboardData.classInfo) {
            localStorage.setItem('class_info', JSON.stringify(dashboardData.classInfo));
          }
          if (dashboardData.trainee) {
            localStorage.setItem('trainee_data', JSON.stringify(dashboardData.trainee));
          }

          setData(dashboardData);
        } else if (dashResult.reason?.response?.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('trainee_data');
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        if (!isBackground && isMounted) {
          setLoading(false);
        }
      }
    };

    // Panggilan pertama saat halaman dibuka
    fetchDashboard(false);

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleDownloadCertificate = async () => {
    try {
      const classId = data.classInfo?.id;
      if (!classId) {
        alert('Informasi kelas tidak ditemukan.');
        return;
      }
      const response = await api.get(`/trainee/certificate/${classId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Sertifikat_${data.trainee?.name || 'Kelulusan'}.pdf`);
      document.body.appendChild(link);
      link.click();
      setTimeout(() => { link.remove(); window.URL.revokeObjectURL(url); }, 100);
    } catch (error) {
      alert(error.response?.data?.message || error.message || 'Gagal mengunduh sertifikat.');
    }
  };

  const openExternalLink = (url) => {
    if (!url) return;
    try {
      if (window.median && typeof window.median.open?.url === 'function') {
        window.median.open.url({ url: url, target: '_blank' });
      } else if (window.gonative && typeof window.gonative.open?.url === 'function') {
        window.gonative.open.url({ url: url, target: '_blank' });
      } else {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } catch {
      window.location.href = url;
    }
  };

  const hasActiveSchedule = Boolean(data.classInfo && data.classInfo.id && !data.classInfo.is_completed);
  const lmsUrl = data.classInfo?.lms_url || "https://e-learning.first-resources.com/";
  const messUrl = data.classInfo?.mess_url || "https://mess-academy.first-resources.com";

  return (
    <div style={{ paddingBottom: '36px', backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      {/* PREMIUM HEADER */}
      <div className="dashboard-header-container" style={{
        background: 'linear-gradient(135deg, #0d3829 0%, #175e47 50%, #0d3829 100%)',
        position: 'relative',
        overflow: 'hidden',
        color: 'white',
        padding: '1rem 1.5rem 5.5rem', // Default mobile padding

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
            padding: '3px',
            borderRadius: '0px', 
            boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img 
              src={logoImg} 
              alt="First Resources Logo" 
              style={{ width: '54px', height: 'auto', objectFit: 'contain', display: 'block', borderRadius: '0px' }} 
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
          <p style={{ fontSize: '14px', marginBottom: '2px', color: '#e2e8f0' }}>Selamat datang,</p>
          <h1 style={{ 
            fontSize: '26px', fontWeight: '800', marginBottom: '10px', 
            lineHeight: '1.2', letterSpacing: '-0.3px', textTransform: 'uppercase',
            color: '#ffffff',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
          }}>
            {data.trainee?.name || (loading ? 'Memuat...' : 'Peserta')}
          </h1>
          
          <div style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.12)', padding: '6px 14px', borderRadius: '20px'
          }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#86d16f', borderRadius: '50%', boxShadow: '0 0 6px rgba(134,209,111,0.6)' }}></div>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#86d16f' }}>
              {data.classInfo?.title ||
                data.classInfo?.subject ||
                (typeof data.todayClass === 'string' ? data.todayClass : data.todayClass?.title || data.todayClass?.subject) ||
                cachedClass?.title ||
                cachedClass?.subject ||
                data.trainee?.materi ||
                data.trainee?.program ||
                'Materi Pelatihan'}
            </span>
          </div>
        </div>
      </div>

      {/* CARDS CONTAINER */}
      <div className="dashboard-cards-grid" style={{ marginTop: '-3.5rem', padding: '0 1.25rem', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', zIndex: 3 }}>
        
        {/* CERTIFICATE BANNER */}
        {showCertBanner && data.classInfo && Boolean(data.classInfo.is_passed) && (
          <div className="dashboard-full-width-card" style={{
            backgroundColor: '#ecfdf5', border: '1px solid #10b981', borderRadius: '20px', padding: '1.25rem',
            position: 'relative', boxShadow: '0 4px 16px rgba(16, 185, 129, 0.1)'
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

        {/* CARD 1: ABSENSI HARI INI */}
        <div style={{ 
          backgroundColor: '#ffffff', borderRadius: '20px', padding: '16px 18px', 
          border: '1px solid #f1f5f9', display: 'flex', flexWrap: 'nowrap', gap: '10px', justifyContent: 'space-between', alignItems: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
             <div style={{ 
               width: '46px', height: '46px', borderRadius: '50%', backgroundColor: '#e8fcf1', 
               display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#047857', flexShrink: 0 
             }}>
               <CheckCircle size={24} strokeWidth={2.5} />
             </div>
             <div style={{ minWidth: 0 }}>
               <p style={{ fontSize: '11.5px', color: '#64748b', margin: '0 0 2px 0', fontWeight: '700', whiteSpace: 'nowrap' }}>Absensi Hari Ini</p>
               <p style={{ fontSize: '17px', fontWeight: '800', color: data.todayAttendance ? '#047857' : '#0f4a38', margin: 0, whiteSpace: 'nowrap' }}>
                 {data.todayAttendance ? 'Sudah Absen' : 'Belum Absen'}
               </p>
             </div>
          </div>
          {!data.todayAttendance && (
            <Link to="/absen" style={{ 
              backgroundColor: '#f43f5e', color: 'white', textDecoration: 'none',
              height: '42px', padding: '0 16px', borderRadius: '12px', fontWeight: '700', fontSize: '13px',
              boxShadow: '0 4px 12px rgba(244, 63, 94, 0.25)', display: 'inline-flex', alignItems: 'center', gap: '6px',
              flexShrink: 0, whiteSpace: 'nowrap'
            }}>
              <QrCode size={17} strokeWidth={2.2} />
              Scan QR
            </Link>
          )}
        </div>

        {/* CARD 2: TUGAS MENUNGGU */}
        <div style={{ 
          backgroundColor: '#ffffff', borderRadius: '20px', padding: '20px', 
          border: '1px solid #f1f5f9', boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          display: 'flex', flexDirection: 'column', gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ 
              width: '48px', height: '48px', borderRadius: '16px', backgroundColor: '#fffbeb', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', flexShrink: 0 
            }}>
              <ClipboardList size={26} strokeWidth={2.2} />
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 2px 0', fontWeight: '700' }}>Tugas Menunggu</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '22px', fontWeight: '800', color: '#0f4a38', lineHeight: 1 }}>{loading ? '0' : data.pendingTasks}</span>
                <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: '700' }}>tugas</span>
              </div>
            </div>
          </div>
          <Link to="/tugas" style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', 
            textDecoration: 'none', height: '48px', padding: '0 14px', borderRadius: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ClipboardList size={20} color="#047857" strokeWidth={2.2} />
              <span style={{ fontWeight: '700', fontSize: '14px', color: '#0f4a38' }}>Lihat Semua Tugas</span>
            </div>
            <ChevronRight size={18} color="#94a3b8" strokeWidth={2.2} />
          </Link>
        </div>

        {/* CARD 3: EVALUASI MENUNGGU */}
        <div style={{ 
          backgroundColor: '#ffffff', borderRadius: '20px', padding: '20px', 
          border: '1px solid #f1f5f9', boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          display: 'flex', flexDirection: 'column', gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ 
              width: '48px', height: '48px', borderRadius: '16px', backgroundColor: '#eff6ff', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', flexShrink: 0 
            }}>
              <Star size={26} strokeWidth={2.2} fill="#3b82f6" />
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 2px 0', fontWeight: '700' }}>Evaluasi Menunggu</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '22px', fontWeight: '800', color: '#0f4a38', lineHeight: 1 }}>{loading ? '0' : (data.pendingEvaluations || 0)}</span>
                <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: '700' }}>Sesi</span>
              </div>
            </div>
          </div>
          <Link to="/evaluasi" style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', 
            textDecoration: 'none', height: '48px', padding: '0 14px', borderRadius: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Star size={20} color="#3b82f6" fill="#3b82f6" strokeWidth={2.2} />
              <span style={{ fontWeight: '700', fontSize: '14px', color: '#0f4a38' }}>Mulai Evaluasi</span>
            </div>
            <ChevronRight size={18} color="#94a3b8" strokeWidth={2.2} />
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
              <h3 style={{ color: '#e8fcf1', fontWeight: '800', fontSize: '1.1rem', marginBottom: '4px' }}>
                {data.classInfo?.is_completed ? 'Pelatihan Telah Selesai' : 'Jadwal Pelatihan Tidak Aktif'}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                {data.classInfo?.is_completed 
                  ? `Sesi pelatihan "${data.classInfo.title}" telah selesai dilaksanakan.` 
                  : 'Saat ini belum ada jadwal kelas yang aktif.'}
              </p>
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
                <h3 style={{ color: '#e8fcf1', fontWeight: '800', fontSize: '1.1rem', marginBottom: '2px' }}>Jadwal Pelatihan Aktif</h3>
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
                    {formatDisplayDateRange(data.classInfo.date, data.classInfo.end_date)}
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
                  href={lmsUrl} 
                  onClick={(e) => {
                    e.preventDefault();
                    openExternalLink(lmsUrl);
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    backgroundColor: '#86d16f', color: '#0d3829', padding: '0.875rem', borderRadius: '12px',
                    textDecoration: 'none', fontWeight: '800', boxShadow: '0 4px 12px rgba(134, 209, 111, 0.3)',
                    width: '100%', cursor: 'pointer'
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
                  href={messUrl} 
                  onClick={(e) => {
                    e.preventDefault();
                    openExternalLink(messUrl);
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    backgroundColor: 'white', color: '#0d3829', padding: '0.875rem', borderRadius: '12px',
                    textDecoration: 'none', fontWeight: '800', border: '2px solid #86d16f',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    width: '100%', cursor: 'pointer'
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


