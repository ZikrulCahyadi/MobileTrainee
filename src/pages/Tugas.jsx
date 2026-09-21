import React, { useState, useEffect, useRef } from 'react';
import { Clock, Upload, X, Trash2, FileText } from 'lucide-react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

const Tugas = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States for upload preview UI
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileError, setFileError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/trainee/tasks');
      setTasks(response.data.data || []);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('trainee_token');
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
    const maxSize = 5 * 1024 * 1024; // 5MB

    const validFiles = files.filter(file => {
      if (!validTypes.includes(file.type)) {
        error = 'Format file tidak didukung. Harap gunakan PDF, JPG, atau PNG.';
        return false;
      }
      if (file.size > maxSize) {
        error = `Ukuran file ${file.name} terlalu besar. Maksimal 5MB per file.`;
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

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('task_files[]', file);
    });

    try {
      setIsUploading(true);
      setFileError('');
      await api.post(`/api/trainee/tasks/${taskId}/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Tugas berhasil dikumpulkan!');
      setExpandedTaskId(null);
      fetchTasks();
    } catch (error) {
      console.error("Error submitting task", error);
      setFileError(error.response?.data?.message || 'Gagal mengumpulkan tugas. Silakan coba lagi.');
    } finally {
      setIsUploading(false);
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
        <div className="card text-center text-light py-8">
          Tidak ada tugas saat ini.
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

            {task.status !== 'Sudah' && (
              <button 
                className="btn-primary" 
                style={{ padding: '0.75rem', fontSize: '0.875rem' }} 
                onClick={() => handleOpenUpload(task.id)}
              >
                Kumpulkan Tugas
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
                  <p className="text-xs text-danger mb-4 font-medium p-3 rounded-lg" style={{ backgroundColor: 'var(--danger-bg)', borderRadius: '8px', border: '1px solid #fecaca' }}>
                    {fileError}
                  </p>
                )}

                {selectedFiles.length > 0 && (
                  <div className="mb-2">
                    <div className="flex flex-col gap-3 mb-4">
                      {selectedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center p-4 rounded-xl shadow-sm" style={{ border: '1px solid var(--primary-dark)', backgroundColor: '#f0fdf4' }}>
                          <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '1rem', border: '1px solid #bbf7d0', marginRight: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FileText size={28} style={{ color: '#ef4444' }} strokeWidth={1.5} />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold text-primary-dark truncate mb-1">{file.name}</p>
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
                    {isUploading ? 'Mengirim...' : `Kirim Tugas (${selectedFiles.length})`}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Tugas;
