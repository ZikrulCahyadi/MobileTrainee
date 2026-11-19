import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPendingEvaluations, submitEvaluation } from '../utils/api';
import { EVALUATION_QUESTIONS, EVALUATION_VALUES } from '../constants/evaluationQuestions';
import { CheckCircle, AlertCircle, Check, FileX, Award, Sparkles, X, ChevronRight } from 'lucide-react';

const BotanicalLeaf = ({ style }) => (
  <svg viewBox="0 0 100 100" style={style}>
    <path fill="currentColor" d="M10,90 Q15,40 50,10 Q80,20 90,60 Q80,85 50,90 Q20,95 10,90 Z" />
    <path fill="none" stroke="currentColor" strokeWidth="2" d="M10,90 Q30,60 50,10" />
    <path fill="none" stroke="currentColor" strokeWidth="1" d="M25,75 Q40,65 50,55" />
    <path fill="none" stroke="currentColor" strokeWidth="1" d="M35,60 Q50,55 60,45" />
    <path fill="none" stroke="currentColor" strokeWidth="1" d="M45,45 Q60,40 70,30" />
  </svg>
);

export default function Evaluasi() {
  const navigate = useNavigate();
  const [pendingSessions, setPendingSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [answers, setAnswers] = useState({});
  const [explanation, setExplanation] = useState('');
  const [kesanPesan, setKesanPesan] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [submittedSession, setSubmittedSession] = useState(null);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await getPendingEvaluations();
      const evalData = res.data || res;
      const evalArray = Array.isArray(evalData) ? evalData : [];
      setPendingSessions(evalArray);
      if (evalArray.length > 0) setActiveSession(evalArray[0]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRadioChange = (qId, value) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const checkNeedsExplanation = () => {
    return Object.values(answers).some(val => val === 'D' || val === 'E');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(answers).length < 12) {
      setFeedback({ type: 'error', text: 'Mohon lengkapi semua pilihan (1-12) terlebih dahulu.' });
      return;
    }
    if (checkNeedsExplanation() && !explanation.trim()) {
      setFeedback({ type: 'error', text: 'Mohon berikan penjelasan karena terdapat pilihan D/E.' });
      return;
    }
    if (!kesanPesan.trim()) {
      setFeedback({ type: 'error', text: 'Mohon tuliskan kesan dan pesan Anda terlebih dahulu.' });
      return;
    }
    
    setSubmitting(true);
    try {
      const currentSession = activeSession;
      await submitEvaluation(currentSession.id, {
        answers,
        explanation_de: explanation,
        kesan_pesan: kesanPesan
      });
      
      // Simpan sesi yang dievaluasi dan tampilkan pop-up tahap 1 (terima kasih isi evaluasi)
      setSubmittedSession(currentSession);
      setModalStep(1);
      setShowSuccessModal(true);
      try {
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      } catch (err) {}

      setHasSubmitted(true);
      setAnswers({}); setExplanation(''); setKesanPesan('');
      fetchPending();
    } catch (error) {
      setFeedback({ type: 'error', text: error.response?.data?.message || 'Terjadi kesalahan' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ paddingBottom: '16px', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
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
          Evaluasi Pelatihan
        </h1>
        {activeSession ? (
          <div style={{ marginTop: '6px' }}>
            <p style={{ fontSize: '13.5px', fontWeight: 'bold', color: '#D1FAE5', margin: '0 0 2px 0' }}>
              Materi: {activeSession.title || activeSession.materi || 'Pelatihan'}
            </p>
            <p style={{ fontSize: '12.5px', color: '#A7F3D0', margin: 0 }}>
              Trainer: {activeSession.trainer_name || activeSession.trainer || '-'}
            </p>
          </div>
        ) : (
          <p style={{ fontSize: '13px', color: '#D1FAE5', margin: '4px 0 0 0' }}>
            Penilaian instruktur &amp; modul pelatihan
          </p>
        )}
      </div>

      {/* OVERLAPPING CONTENT CONTAINER */}
      <div style={{ marginTop: '-1.75rem', padding: '0 16px', position: 'relative', zIndex: 2 }}>
        {loading ? (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #f1f5f9',
            padding: '2.5rem 1rem',
            textAlign: 'center',
            color: '#64748b',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
          }}>
            Memuat evaluasi...
          </div>
        ) : (pendingSessions.length === 0 && !showSuccessModal) ? (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #f1f5f9',
            padding: '36px 24px',
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: hasSubmitted ? '#dcfce7' : '#e8fcf1',
              color: hasSubmitted ? '#16a34a' : '#047857',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              {hasSubmitted ? <Check size={32} strokeWidth={2.5} /> : <CheckCircle size={32} strokeWidth={2.2} />}
            </div>
            
            <h3 style={{ fontSize: '17px', fontWeight: 'bold', color: '#0f4a38', margin: '0 0 6px 0' }}>
              {hasSubmitted ? 'Pelatihan Telah Dievaluasi' : 'Belum Ada Evaluasi Aktif'}
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0', lineHeight: '1.5' }}>
              {hasSubmitted 
                ? 'Terima kasih atas partisipasi Anda dalam mengevaluasi pelatihan ini.' 
                : 'Saat ini tidak ada sesi pelatihan yang perlu Anda evaluasi.'}
            </p>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', width: '100%', flexWrap: 'wrap' }}>
              <button 
                type="button" 
                style={{ 
                  backgroundColor: '#f1f5f9', 
                  color: '#334155', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '12px', 
                  padding: '12px 20px', 
                  fontWeight: 'bold', 
                  fontSize: '13px',
                  cursor: 'pointer' 
                }}
                onClick={() => { setLoading(true); fetchPending(); }}
              >
                Periksa Ulang
              </button>
              <button 
                type="button"
                style={{
                  backgroundColor: '#0d3829',
                  color: '#ffffff',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(13, 56, 41, 0.2)'
                }}
                onClick={() => navigate('/')}
              >
                Kembali ke Dashboard
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
        {EVALUATION_QUESTIONS.map((cat, cIdx) => (
          <div key={cIdx} className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontWeight: 'bold', color: 'var(--primary-dark)', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
              {cat.category}
            </h3>
            
            {cat.items.map((q, qIdx) => (
              <div key={q.id} style={{ marginBottom: '1.5rem' }}>
                <p style={{ color: 'var(--text-dark)', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                  {qIdx + 1}. {q.text}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {q.options.map((opt, i) => {
                    const val = EVALUATION_VALUES[i];
                    const isChecked = answers[q.id] === val;
                    return (
                      <label key={i} style={{ 
                        display: 'flex', alignItems: 'center', padding: '0.75rem', 
                        border: isChecked ? '1px solid var(--primary-dark)' : '1px solid #e2e8f0', 
                        borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s',
                        backgroundColor: isChecked ? '#f0fdf4' : '#fff'
                      }}>
                        <input 
                          type="radio" 
                          name={q.id} 
                          value={val} 
                          checked={isChecked} 
                          onChange={() => handleRadioChange(q.id, val)} 
                          style={{ display: 'none' }} 
                        />
                        <div style={{ 
                          width: '20px', height: '20px', borderRadius: '50%', border: '2px solid', 
                          borderColor: isChecked ? 'var(--primary-dark)' : '#cbd5e1', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '0.75rem' 
                        }}>
                          {isChecked && <div style={{ width: '10px', height: '10px', backgroundColor: 'var(--primary-dark)', borderRadius: '50%' }}></div>}
                        </div>
                        <span style={{ fontSize: '0.875rem', color: isChecked ? 'var(--primary-dark)' : 'var(--text-light)', fontWeight: isChecked ? 'bold' : 'normal' }}>
                          {val} - {opt}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ))}
        
        {checkNeedsExplanation() && (
          <div className="card" style={{ padding: '1.25rem', backgroundColor: '#fff7ed', border: '1px solid #fed7aa' }}>
            <h3 style={{ fontWeight: 'bold', color: '#9a3412', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Penjelasan Nilai D / E</h3>
            <textarea 
              required 
              value={explanation} 
              onChange={e => setExplanation(e.target.value)} 
              rows="3" 
              style={{ width: '100%', borderRadius: '12px', border: '1px solid #fed7aa', padding: '0.75rem', fontSize: '0.875rem', outline: 'none' }} 
              placeholder="Berikan penjelasan Anda..."
            ></textarea>
          </div>
        )}
        
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontWeight: 'bold', color: 'var(--primary-dark)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Kesan & Pesan (Wajib)</h3>
          <textarea 
            required 
            value={kesanPesan} 
            onChange={e => setKesanPesan(e.target.value)} 
            rows="4" 
            style={{ width: '100%', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '0.75rem', fontSize: '0.875rem', backgroundColor: '#f8fafc', outline: 'none' }} 
            placeholder="Tuliskan kesan dan pesan Anda selama mengikuti pelatihan ini..."
          ></textarea>
        </div>
        
        <button 
          type="submit" 
          disabled={submitting} 
          className="btn-primary"
          style={{ width: '100%', padding: '1rem', fontSize: '1rem', fontWeight: 'bold', opacity: submitting ? 0.7 : 1 }}
        >
          {submitting ? 'Mengirim...' : 'Kirim Evaluasi'}
        </button>
      </form>
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
              backgroundColor: feedback.type === 'success' ? '#dcfce3' : '#fee2e2',
              color: feedback.type === 'success' ? '#10b981' : '#ef4444'
            }}>
              {feedback.type === 'success' ? <CheckCircle size={36} /> : <AlertCircle size={36} />}
            </div>
            
            <h3 style={{ fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--primary-dark)' }}>
              {feedback.type === 'success' ? 'Berhasil!' : 'Gagal'}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-light)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
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
              onClick={() => {
                setFeedback(null);
                if (feedback.type === 'success' && pendingSessions.length <= 1) {
                   navigate('/');
                }
              }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* POP-UP EVALUASI / PELATIHAN (2-STEP MODAL) */}
      {showSuccessModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(13, 56, 41, 0.75)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.25rem',
          zIndex: 99999
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '28px',
            padding: '2rem 1.75rem',
            maxWidth: '380px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Close Button top-right */}
            <button
              onClick={() => {
                setShowSuccessModal(false);
                setModalStep(1);
                navigate('/');
              }}
              style={{
                position: 'absolute', top: '16px', right: '16px',
                background: '#f1f5f9', border: 'none', borderRadius: '50%',
                width: '32px', height: '32px', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: '#64748b', cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>

            {modalStep === 1 ? (
              /* TAHAP 1: TERIMA KASIH TELAH ISI EVALUASI */
              <div>
                {/* Icon Checkmark */}
                <div style={{
                  width: '76px', height: '76px',
                  borderRadius: '24px',
                  background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                  border: '2px solid #86d16f',
                  color: '#16a34a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)'
                }}>
                  <CheckCircle size={40} strokeWidth={2.2} />
                </div>

                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  backgroundColor: '#ecfdf5', color: '#047857',
                  padding: '4px 12px', borderRadius: '20px',
                  fontSize: '0.75rem', fontWeight: '800',
                  marginBottom: '0.75rem', letterSpacing: '0.5px'
                }}>
                  <Sparkles size={14} color="#059669" />
                  EVALUASI TERKIRIM
                </div>

                <h2 style={{
                  fontSize: '1.35rem', fontWeight: '800',
                  color: '#0d3829', marginBottom: '0.5rem',
                  letterSpacing: '-0.3px', lineHeight: 1.3
                }}>
                  Terima Kasih!
                </h2>

                <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                  Evaluasi pelatihan telah berhasil dikirimkan. Penilaian Anda sangat bermanfaat bagi evaluasi instruktur dan pengembangan materi First Resources Academy.
                </p>

                {submittedSession && (
                  <div style={{
                    backgroundColor: '#f8fafc',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '0.875rem 1rem',
                    marginBottom: '1.5rem',
                    textAlign: 'center'
                  }}>
                    <p style={{
                      fontSize: '0.95rem', fontWeight: '800',
                      color: '#0f4a38', margin: 0, lineHeight: 1.4
                    }}>
                      {submittedSession.title}
                    </p>
                    {submittedSession.trainer_name && (
                      <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', marginBottom: 0 }}>
                        Trainer: {submittedSession.trainer_name}
                      </p>
                    )}
                  </div>
                )}

                <button
                  onClick={() => setModalStep(2)}
                  style={{
                    width: '100%',
                    backgroundColor: '#0d3829',
                    color: 'white',
                    border: 'none',
                    padding: '0.95rem 1.5rem',
                    borderRadius: '14px',
                    fontSize: '0.95rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 8px 20px rgba(13, 56, 41, 0.25)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span>Lanjut</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            ) : (
              /* TAHAP 2: TERIMA KASIH TELAH MENGIKUTI TRAINING / PELATIHAN SELESAI */
              <div>
                {/* Celebration Award Icon */}
                <div style={{
                  width: '76px', height: '76px',
                  borderRadius: '24px',
                  background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                  border: '2px solid #86d16f',
                  color: '#047857',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)'
                }}>
                  <Award size={40} strokeWidth={2.2} />
                </div>

                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  backgroundColor: '#ecfdf5', color: '#047857',
                  padding: '4px 12px', borderRadius: '20px',
                  fontSize: '0.75rem', fontWeight: '800',
                  marginBottom: '0.75rem', letterSpacing: '0.5px'
                }}>
                  <Sparkles size={14} color="#059669" />
                  PELATIHAN SELESAI
                </div>

                <h2 style={{
                  fontSize: '1.35rem', fontWeight: '800',
                  color: '#0d3829', marginBottom: '0.5rem',
                  letterSpacing: '-0.3px', lineHeight: 1.3
                }}>
                  Pelatihan Selesai!
                </h2>

                <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                  Selamat! Anda telah menyelesaikan seluruh rangkaian kegiatan pelatihan. Terima kasih atas dedikasi dan partisipasi aktif Anda.
                </p>

                {submittedSession && (
                  <div style={{
                    backgroundColor: '#f8fafc',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '0.875rem 1rem',
                    marginBottom: '1.5rem',
                    textAlign: 'center'
                  }}>
                    <p style={{
                      fontSize: '0.95rem', fontWeight: '800',
                      color: '#0f4a38', margin: 0, lineHeight: 1.4
                    }}>
                      {submittedSession.title}
                    </p>
                    {submittedSession.trainer_name && (
                      <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', marginBottom: 0 }}>
                        Trainer: {submittedSession.trainer_name}
                      </p>
                    )}
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      marginTop: '8px',
                      backgroundColor: '#dcfce7',
                      color: '#16a34a',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontWeight: '700',
                      fontSize: '0.75rem'
                    }}>
                      <CheckCircle size={14} color="#16a34a" />
                      Status: Pelatihan Telah Selesai
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    setModalStep(1);
                    navigate('/');
                  }}
                  style={{
                    width: '100%',
                    backgroundColor: '#0d3829',
                    color: 'white',
                    border: 'none',
                    padding: '0.95rem 1.5rem',
                    borderRadius: '14px',
                    fontSize: '0.95rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 8px 20px rgba(13, 56, 41, 0.25)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Kembali ke Beranda
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
