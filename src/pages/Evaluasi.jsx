import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPendingEvaluations, submitEvaluation } from '../utils/api';
import { EVALUATION_QUESTIONS, EVALUATION_VALUES } from '../constants/evaluationQuestions';
import { CheckCircle, AlertCircle, Check, FileX } from 'lucide-react';

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
    
    setSubmitting(true);
    try {
      await submitEvaluation(activeSession.id, {
        answers,
        explanation_de: explanation,
        kesan_pesan: kesanPesan
      });
      setFeedback({ type: 'success', text: 'Terima kasih telah mengisi evaluasi ini.' });
      setHasSubmitted(true);
      setAnswers({}); setExplanation(''); setKesanPesan('');
      fetchPending();
    } catch (error) {
      setFeedback({ type: 'error', text: error.response?.data?.message || 'Terjadi kesalahan' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>Memuat data...</div>;
  
  if (pendingSessions.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', marginTop: '3rem' }}>
        <div style={{ width: '64px', height: '64px', backgroundColor: hasSubmitted ? '#dcfce3' : '#f1f5f9', color: hasSubmitted ? '#16a34a' : '#64748b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
          {hasSubmitted ? <Check size={32} strokeWidth={3} /> : <FileX size={32} />}
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
          {hasSubmitted ? 'Pelatihan Telah Dievaluasi' : 'Belum Ada Evaluasi'}
        </h2>
        <p style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>
          {hasSubmitted ? 'Terima kasih atas partisipasi Anda.' : 'Saat ini tidak ada sesi pelatihan yang perlu Anda evaluasi.'}
        </p>
        <button 
          className="btn-primary" 
          style={{ marginTop: '1.5rem', padding: '0.75rem 2rem' }}
          onClick={() => navigate('/')}
        >
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '6rem', backgroundColor: 'var(--bg-color)', minHeight: '100vh' }}>
      
      {/* HEADER EVALUASI */}
      <div className="dashboard-header-container" style={{ 
        background: 'linear-gradient(135deg, #0d3829 0%, #175e47 50%, #0d3829 100%)', 
        color: 'white', 
        padding: '1.5rem', 
        paddingTop: '2.5rem', 
        borderBottomLeftRadius: '32px', 
        borderBottomRightRadius: '32px', 
        boxShadow: '0 10px 30px rgba(13, 56, 41, 0.2)', 
        marginBottom: '1.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow & Decorative elements to match dashboard slightly */}
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(134,209,111,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        
        {/* Decorative Leaves */}
        <BotanicalLeaf style={{ position: 'absolute', top: '-20%', right: '-5%', width: '150px', height: '150px', color: '#114b3d', opacity: 0.4, transform: 'rotate(15deg)', pointerEvents: 'none' }} />
        <BotanicalLeaf style={{ position: 'absolute', bottom: '-40%', right: '15%', width: '120px', height: '120px', color: '#1a6a51', opacity: 0.3, transform: 'rotate(-45deg)', pointerEvents: 'none' }} />

        <h1 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '1rem', position: 'relative', zIndex: 2 }}>
          Evaluasi Training
        </h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', position: 'relative', zIndex: 2 }}>
          <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>
            <span style={{ fontWeight: 'normal', opacity: 0.75 }}>Materi: </span>
            <span style={{ fontWeight: 'bold' }}>{activeSession.title}</span>
          </p>
          <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>
            <span style={{ fontWeight: 'normal', opacity: 0.75 }}>Trainer: </span>
            <span style={{ fontWeight: 'bold' }}>{activeSession.trainer_name}</span>
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="dashboard-form-container" style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
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
            placeholder="Tuliskan kesan dan pesan Anda selama mengikuti training ini..."
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
    </div>
  );
}
