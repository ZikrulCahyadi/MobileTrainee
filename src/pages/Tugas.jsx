import React, { useState, useEffect, useRef } from 'react';
import { Clock, Upload, X, Trash2, FileText, CheckCircle, AlertCircle, FileX, ClipboardList, Camera, Image as ImageIcon } from 'lucide-react';
import api from '../utils/api';
import { useNavigate, Link } from 'react-router-dom';
import imageCompression from 'browser-image-compression';

const Tugas = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emptySubtitle, setEmptySubtitle] = useState('Saat ini belum ada tugas baru yang perlu dikerjakan.');
  
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
  const cameraInputRef = useRef(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/trainee/tasks');
      const list = response.data?.data || (Array.isArray(response.data) ? response.data : []);
      setTasks(list);
      if (response.data?.message) {
        setEmptySubtitle(response.data.message);
      } else {
        setEmptySubtitle('Saat ini belum ada tugas baru yang perlu dikerjakan.');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('trainee_data');
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
    if (cameraInputRef.current) {
      cameraInputRef.current.value = null;
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    validateAndAddFiles(files);
  };

  const validateAndAddFiles = (files) => {
    let error = '';
    const maxFileSize = 10 * 1024 * 1024; // 10MB (sesuai backend & APK)
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.ppt', '.pptx'];

    const validFiles = files.filter(file => {
      const lowerName = file.name.toLowerCase();
      const hasValidExt = allowedExtensions.some(ext => lowerName.endsWith(ext));
      if (!hasValidExt) {
        error = 'Format file tidak didukung. Harap gunakan PDF, JPG, PNG, Word (DOC/DOCX), atau PPT.';
        return false;
      }
      if (file.size > maxFileSize) {
        error = `Ukuran file ${file.name} melebihi batas maksimal 10 MB per file.`;
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

      await api.post(`/trainee/tasks/${taskId}/submit`, formData);
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
    <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', paddingBottom: '16px' }}>
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
          Tugas Pelatihan
        </h1>
        <p style={{ fontSize: '13px', color: '#D1FAE5', margin: 0 }}>
          Daftar tugas &amp; modul pelatihan
        </p>
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
            Memuat tugas...
          </div>
        ) : tasks.length === 0 ? (
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
              backgroundColor: emptySubtitle.toLowerCase().includes('absensi') ? '#FEF3C7' : '#e8fcf1',
              color: emptySubtitle.toLowerCase().includes('absensi') ? '#D97706' : '#047857',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              {emptySubtitle.toLowerCase().includes('absensi') ? (
                <AlertCircle size={32} strokeWidth={2.2} />
              ) : (
                <ClipboardList size={32} strokeWidth={2.2} />
              )}
            </div>
            
            <h3 style={{ fontSize: '17px', fontWeight: 'bold', color: '#0f4a38', margin: '0 0 6px 0' }}>
              {emptySubtitle.toLowerCase().includes('absensi') ? 'Perhatian' : 'Belum Ada Tugas'}
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0', lineHeight: '1.5', maxWidth: '320px' }}>
              {emptySubtitle}
            </p>
            
            {emptySubtitle.toLowerCase().includes('absensi') ? (
              <Link to="/absen" style={{
                backgroundColor: '#0d3829',
                color: '#ffffff',
                padding: '12px 24px',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '14px',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(13, 56, 41, 0.2)'
              }}>
                Lakukan Absensi Sekarang
              </Link>
            ) : (
              <Link to="/" style={{
                backgroundColor: '#0d3829',
                color: '#ffffff',
                padding: '12px 24px',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '14px',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(13, 56, 41, 0.2)'
              }}>
                Kembali ke Dashboard
              </Link>
            )}
          </div>
        ) : (
          tasks.map((task, index) => (
          <div className="card" key={task.id || `task-${index}`} style={{ overflow: 'hidden' }}>
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
                      borderRadius: '16px', 
                      padding: '24px 16px', 
                      textAlign: 'center',
                      backgroundColor: '#f8fafc',
                      marginBottom: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: '#e8fcf1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0d3829',
                      marginBottom: '10px'
                    }}>
                      <Upload size={24} strokeWidth={2.2} />
                    </div>
                    <p style={{ fontSize: '13.5px', fontWeight: 'bold', color: '#0f4a38', margin: '0 0 3px 0' }}>
                      Pilih file dokumen atau ambil foto langsung
                    </p>
                    <p style={{ fontSize: '11.5px', color: '#64748b', margin: '0 0 16px 0' }}>
                      Bisa upload lebih dari 1 file/foto (maks 10MB per file)
                    </p>
                    
                    {/* DUAL ACTION BUTTONS: AMBIL FOTO & BROWSE FILE */}
                    <div style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '340px' }}>
                      <button 
                        type="button"
                        style={{
                          flex: 1,
                          height: '44px',
                          backgroundColor: '#0d3829',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '10px',
                          fontWeight: 'bold',
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(13, 56, 41, 0.2)'
                        }}
                        onClick={() => cameraInputRef.current?.click()}
                      >
                        <Camera size={17} strokeWidth={2.2} />
                        <span>Ambil Foto</span>
                      </button>

                      <button 
                        type="button"
                        style={{
                          flex: 1,
                          height: '44px',
                          backgroundColor: '#f1f5f9',
                          color: '#0f4a38',
                          border: '1px solid #cbd5e1',
                          borderRadius: '10px',
                          fontWeight: 'bold',
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          cursor: 'pointer'
                        }}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload size={17} strokeWidth={2.2} />
                        <span>Browse File</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* HIDDEN INPUT FOR BROWSE FILE (Hanya Membuka File/Dokumen di HP, Tanpa Membuka Kamera) */}
                <input 
                  type="file" 
                  multiple 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                />

                {/* HIDDEN INPUT FOR DIRECT CAMERA (Hanya Membuka Kamera Langsung untuk Ambil Foto) */}
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  ref={cameraInputRef} 
                  style={{ display: 'none' }} 
                  onChange={handleFileChange}
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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#0f4a38', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>File Terpilih</span>
                        <span style={{ backgroundColor: '#e8fcf1', color: '#047857', fontSize: '11px', padding: '2px 8px', borderRadius: '12px', fontWeight: '700' }}>
                          {selectedFiles.length}
                        </span>
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                      {selectedFiles.map((file, idx) => (
                        <div 
                          key={idx} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            backgroundColor: '#ffffff', 
                            border: '1px solid #e2e8f0', 
                            borderRadius: '12px', 
                            padding: '10px 12px', 
                            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {/* THUMBNAIL / PREVIEW */}
                          <div style={{ 
                            width: '44px', 
                            height: '44px', 
                            backgroundColor: '#f1f5f9', 
                            borderRadius: '8px', 
                            border: '1px solid #e2e8f0', 
                            marginRight: '12px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            overflow: 'hidden',
                            flexShrink: 0
                          }}>
                            {file.type.startsWith('image/') ? (
                              <img 
                                src={URL.createObjectURL(file)} 
                                alt="preview" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                              />
                            ) : (
                              <FileText size={22} style={{ color: '#0d3829' }} strokeWidth={1.8} />
                            )}
                          </div>

                          {/* FILE INFO */}
                          <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
                            <p 
                              style={{ 
                                fontSize: '13px',
                                fontWeight: '700',
                                color: '#0f4a38',
                                whiteSpace: 'nowrap', 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis',
                                margin: '0 0 2px 0'
                              }}
                              title={file.name}
                            >
                              {file.name}
                            </p>
                            <p style={{ margin: 0, fontSize: '11.5px', color: '#64748b', fontWeight: '500' }}>
                              {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type.startsWith('image/') ? 'Foto Kamera (JPG)' : 'Dokumen'}
                            </p>
                          </div>

                          {/* DELETE ICON BUTTON */}
                          <button 
                            type="button"
                            onClick={() => removeFile(idx)} 
                            title="Hapus file ini"
                            style={{ 
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: '#fee2e2',
                              border: 'none',
                              color: '#ef4444', 
                              cursor: 'pointer', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              flexShrink: 0,
                              padding: 0,
                              transition: 'background-color 0.15s ease'
                            }}
                          >
                            <Trash2 size={15} strokeWidth={2.2} />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    {/* MORE ACTION BUTTONS: + FOTO LAGI & + TAMBAH FILE */}
                    <div style={{ display: 'flex', gap: '8px', width: '100%', marginBottom: '16px' }}>
                      <button 
                        type="button"
                        style={{
                          flex: 1,
                          height: '40px',
                          backgroundColor: '#0d3829',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '10px',
                          fontWeight: 'bold',
                          fontSize: '12.5px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          cursor: 'pointer'
                        }}
                        onClick={() => cameraInputRef.current?.click()}
                      >
                        <Camera size={15} strokeWidth={2.2} />
                        <span>+ Foto Lagi</span>
                      </button>

                      <button 
                        type="button"
                        style={{
                          flex: 1,
                          height: '40px',
                          backgroundColor: '#f1f5f9',
                          color: '#0f4a38',
                          border: '1px solid #cbd5e1',
                          borderRadius: '10px',
                          fontWeight: 'bold',
                          fontSize: '12.5px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          cursor: 'pointer'
                        }}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload size={15} strokeWidth={2.2} />
                        <span>+ Tambah File</span>
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
      </div>

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

