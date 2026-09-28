import React, { useState, useEffect, useRef } from 'react';
import { Clock, Upload, X, Trash2, FileText, CheckCircle, AlertCircle, FileX } from 'lucide-react';
import api from '../utils/api';
import { useNavigate, Link } from 'react-router-dom';
import imageCompression from 'browser-image-compression';

const Tugas = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States for upload preview UI
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileError, setFileError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadText, setUploadText] = useState('Mengirim...');
  const [feedback, setFeedback] = useState(null);
  
  // States for cancel confirmation
  const [cancelConfirmTaskId, setCancelConfirmTaskId] = useState(null);
  const [isCanceling, setIsCanceling] = useState(false);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/trainee/tasks');
      setTasks(response.data.data || []);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('auth_token');
        navigate('/login');
      }
      console.error("Error fetching tasks", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUpload = (taskId) => {
    if (expandedTaskId === taskId) {
      setExpandedTaskId(null);
    } else {
      setExpandedTaskId(taskId);
      setSelectedFiles([]);
      setFileError('');
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    validateAndAddFiles(files);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    validateAndAddFiles(files);
  };

  const validateAndAddFiles = (files) => {
    let error = '';
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const maxPdfSize = 2 * 1024 * 1024; // 2MB

    const validFiles = files.filter(file => {
      if (!validTypes.includes(file.type)) {
        error = 'Format file tidak didukung. Harap gunakan PDF, JPG, atau PNG.';
        return false;
      }
      if (file.type === 'application/pdf' && file.size > maxPdfSize) {
        error = `Ukuran PDF terlalu besar. Maksimal 2 MB.`;
        return false;
      }
      return true;
    });

    if (error) {
      setFileError(error);
    } else {
      setFileError('');
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (indexToRemove) => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmitFiles = async (taskId) => {
    if (selectedFiles.length === 0) {
      setFileError('Silakan pilih minimal 1 file untuk diunggah.');
      return;
    }

    try {
      setIsUploading(true);
      setFileError('');

      const formData = new FormData();
      
      const hasImage = selectedFiles.some(file => file.type.startsWith('image/'));
      setUploadText(hasImage ? 'Mengompres gambar...' : 'Menyiapkan file...');

      for (const file of selectedFiles) {
        if (file.type.startsWith('image/')) {
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true
          };
          try {
            const compressedFile = await imageCompression(file, options);
            formData.append('task_files[]', compressedFile);
          } catch (error) {
            console.error("Error compressing image", error);
            formData.append('task_files[]', file);
          }
        } else {
          formData.append('task_files[]', file);
        }
      }

      setUploadText('Mengirim...');

      await api.post(`/trainee/tasks/${taskId}/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setFeedback({ type: 'success', text: 'Tugas berhasil dikumpulkan!' });
      setExpandedTaskId(null);
      setSelectedFiles([]);
      fetchTasks();
    } catch (error) {
      console.error("Error submitting task", error);
      setFeedback({ type: 'error', text: error.response?.data?.message || 'Gagal mengumpulkan tugas. Silakan coba lagi.' });
    } finally {
      setIsUploading(false);
      setUploadText('Mengirim...');
    }
  };

  const handleCancelSubmission = async (taskId) => {
    try {
      setIsCanceling(true);
      await api.delete(`/trainee/tasks/${taskId}/submit`);
      setCancelConfirmTaskId(null);
      setExpandedTaskId(null);
      fetchTasks();
    } catch (error) {
      console.error("Error canceling task", error);
      setFeedback({ type: 'error', text: error.response?.data?.message || 'Gagal membatalkan pengumpulan tugas.' });
    } finally {
      setIsCanceling(false);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-6 mt-2">
        <h2 className="text-xl font-bold text-primary-dark mb-1">Tugas Training</h2>
        <p className="text-sm text-light">Daftar tugas dari materi yang telah diikuti.</p>
      </div>

      {loading ? (
        <p className="text-center text-light mt-10">Memuat tugas...</p>
      ) : tasks.length === 0 ? (
        <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 1.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: '#f8fafc', color: '#64748b'
          }}>
            <FileX size={40} />
          </div>
          
          <h3 className="font-bold text-xl mb-3" style={{ color: 'var(--primary-dark)' }}>
            Belum Ada Tugas
          </h3>
          <p className="text-sm text-light mb-8" style={{ lineHeight: '1.6' }}>
            Saat ini tidak ada tugas pelatihan yang perlu Anda selesaikan.
          </p>
          
          <Link to="/" className="btn-primary" style={{ display: 'inline-block', width: '100%', textDecoration: 'none' }}>
            Kembali ke Dashboard
          </Link>
        </div>
      ) : (
        tasks.map((task) => (
          <div className="card" key={task.id || Math.random()} style={{ overflow: 'hidden' }}>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-light text-xs uppercase">{task.session || 'Materi'}</h3>
              <span className={`status-badge ${task.status === 'Sudah' ? '' : 'red'}`} style={{ fontSize: '0.65rem' }}>
                {task.status === 'Sudah' ? 'Sudah Dikerjakan' : 'Belum Dikerjakan'}
              </span>
            </div>
            
            <p className="font-bold text-primary-dark text-lg mb-2">{task.title || 'Judul Tugas'}</p>
            
            <div className="flex items-center gap-2 text-light text-xs mb-4">
              <Clock size={14} />
              <span>Tenggat: {task.deadline_formatted || '-'}</span>
            </div>

            {task.deadline_raw && new Date(task.deadline_raw) < new Date() ? (
              <button 
                style={{ 
                  padding: '0.75rem', fontSize: '0.875rem', backgroundColor: '#f1f5f9', 
                  border: '1px solid #e2e8f0', color: '#94a3b8', 
                  cursor: 'not-allowed', borderRadius: '8px', width: '100%', fontWeight: '600' 
                }} 
                disabled
              >
                {task.status === 'Sudah' ? 'Tugas Telah Dikumpulkan (Waktu Habis)' : 'Waktu Pengumpulan Habis'}
              </button>
            ) : task.status !== 'Sudah' ? (
              <button 
                className="btn-primary" 
                style={{ padding: '0.75rem', fontSize: '0.875rem' }} 
                onClick={() => handleOpenUpload(task.id)}
              >
                Kumpulkan Tugas
              </button>
            ) : (
              <button 
                style={{ 
                  padding: '0.75rem', fontSize: '0.875rem', backgroundColor: 'transparent', 
                  border: '1px solid #ef4444', color: '#ef4444', 
                  cursor: 'pointer', borderRadius: '8px', width: '100%', fontWeight: '600' 
                }} 
                onClick={() => setCancelConfirmTaskId(task.id)}
              >
                Batalkan Pengumpulan
              </button>
            )}

            {expandedTaskId === task.id && (
              <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '1.25rem', paddingTop: '1.25rem' }}>
                <h4 className="font-bold text-primary-dark text-sm" style={{ marginBottom: '1rem' }}>Upload File Tugas</h4>
                
                {selectedFiles.length === 0 && (
                  <div 
                    style={{ 
                      border: '2px dashed #cbd5e1', 
                      borderRadius: '12px', 
                      padding: '2.5rem 1rem', 
                      textAlign: 'center',
                      backgroundColor: '#f8fafc',
                      marginBottom: '1.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={32} style={{ color: '#94a3b8', marginBottom: '0.75rem' }} />
                    <p className="text-sm text-primary-dark font-medium mb-1">Pilih atau letakkan beberapa file di sini</p>
                    <p className="text-xs text-light" style={{ marginBottom: '1.25rem' }}>Format PDF/JPG/PNG maks 5MB per file</p>
                    
                    <button 
                      className="btn-primary" 
                      style={{ display: 'inline-block', width: 'auto', backgroundColor: '#fff', color: 'var(--primary-dark)', border: '1px solid #cbd5e1', padding: '0.5rem 1.25rem', fontSize: '0.875rem', borderRadius: '8px', fontWeight: '600' }}
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    >
                      Browse Files
                    </button>
                  </div>
                )}

                <input 
                  type="file" 
                  multiple 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                />

                {fileError && (
                  <div 
                    className="mb-4 flex items-start gap-3 p-4" 
                    style={{ 
                      backgroundColor: '#fef2f2', 
                      borderRadius: '8px', 
                      borderLeft: '4px solid #ef4444',
                      borderTop: '1px solid #fee2e2',
                      borderRight: '1px solid #fee2e2',
                      borderBottom: '1px solid #fee2e2',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    <AlertCircle size={18} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                    <p className="text-sm font-medium" style={{ color: '#991b1b', lineHeight: '1.5' }}>
                      {fileError}
                    </p>
                  </div>
                )}

                {selectedFiles.length > 0 && (
                  <div className="mb-2">
                    <div className="flex flex-col gap-3 mb-4">
                      {selectedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center p-4 rounded-xl shadow-sm" style={{ border: '1px solid var(--primary-dark)', backgroundColor: '#f0fdf4' }}>
                          <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '1rem', border: '1px solid #bbf7d0', marginRight: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FileText size={28} style={{ color: '#ef4444' }} strokeWidth={1.5} />
                          </div>
                          <div className="flex-1" style={{ minWidth: 0, overflow: 'hidden' }}>
                            <p 
                              className="text-sm font-bold text-primary-dark mb-1" 
                              style={{ 
                                whiteSpace: 'nowrap', 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis' 
                              }}
                            >
                              {file.name}
                            </p>
                            <p className="text-xs text-light mb-2">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                            <button 
                              onClick={() => removeFile(idx)} 
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 'bold', padding: 0 }}
                            >
                              <Trash2 size={14} />
                              Hapus File
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-center mb-6 mt-4">
                      <button 
                        style={{ background: 'none', border: 'none', color: 'var(--primary-dark)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '700', textDecoration: 'underline' }}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        + Tambah File Lain
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 w-full" style={{ display: 'flex', width: '100%' }}>
                  <button 
                    style={{ flex: 1, padding: '0.875rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: 'var(--primary-dark)', fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    onClick={() => setExpandedTaskId(null)}
                    disabled={isUploading}
                  >
                    Batal
                  </button>
                  <button 
                    style={{ 
                      flex: 1,
                      padding: '0.875rem', 
                      borderRadius: '8px', 
                      border: 'none', 
                      backgroundColor: selectedFiles.length > 0 ? '#047857' : '#94a3b8', 
                      color: 'white', 
                      fontWeight: '700', 
                      fontSize: '0.875rem',
                      cursor: selectedFiles.length > 0 ? 'pointer' : 'not-allowed',
                      opacity: isUploading ? 0.7 : 1,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                    disabled={selectedFiles.length === 0 || isUploading}
                    onClick={() => handleSubmitFiles(task.id)}
                  >
                    {isUploading ? uploadText : `Kirim Tugas (${selectedFiles.length})`}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}

      {/* Confirmation Modal for Canceling Submission */}
      {cancelConfirmTaskId && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9998,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1.5rem', backdropFilter: 'blur(2px)'
        }}>
          <div className="card" style={{ 
            width: '100%', maxWidth: '340px', padding: '2rem 1.5rem', 
            textAlign: 'center', borderRadius: '16px', backgroundColor: '#fff',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 1.25rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: '#fee2e2', color: '#ef4444'
            }}>
              <AlertCircle size={32} />
            </div>
            
            <h3 className="font-bold text-xl mb-2" style={{ color: 'var(--primary-dark)' }}>
              Batalkan Pengumpulan?
            </h3>
            <p className="text-sm text-light mb-6" style={{ lineHeight: '1.5' }}>
              File yang sudah Anda kumpulkan akan dihapus secara permanen dari sistem. Anda yakin ingin melanjutkan?
            </p>
            
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                style={{ 
                  flex: 1, padding: '0.875rem', borderRadius: '10px', 
                  fontWeight: 'bold', border: '1px solid #cbd5e1', cursor: 'pointer',
                  backgroundColor: '#fff', color: 'var(--primary-dark)'
                }}
                disabled={isCanceling}
                onClick={() => setCancelConfirmTaskId(null)}
              >
                Tidak
              </button>
              <button 
                style={{ 
                  flex: 1, padding: '0.875rem', borderRadius: '10px', 
                  fontWeight: 'bold', border: 'none', cursor: 'pointer',
                  backgroundColor: '#ef4444', color: '#ffffff',
                  opacity: isCanceling ? 0.7 : 1
                }}
                disabled={isCanceling}
                onClick={() => handleCancelSubmission(cancelConfirmTaskId)}
              >
                {isCanceling ? 'Memproses...' : 'Ya, Batalkan'}
              </button>
            </div>
          </div>
        </div>
      )}

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
        </div>
      )}
    </div>
  );
};

export default Tugas;

