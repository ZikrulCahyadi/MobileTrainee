import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

const Tugas = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);

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

  const handleFileUpload = async (e, taskId) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('task_files[]', files[i]);
    }

    try {
      setUploadingId(taskId);
      await api.post(`/api/trainee/tasks/${taskId}/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Tugas berhasil dikumpulkan!');
      fetchTasks(); // Refresh list after submit
    } catch (error) {
      console.error("Error submitting task", error);
      alert('Gagal mengumpulkan tugas.');
    } finally {
      setUploadingId(null);
      // Reset input file value
      e.target.value = null;
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
          <div className="card" key={task.id || Math.random()}>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-light text-xs uppercase">{task.materi_title || 'Materi'}</h3>
              <span className={`status-badge ${task.status === 'Selesai' ? '' : 'red'}`} style={{ fontSize: '0.65rem' }}>
                {task.status || 'Belum Dikerjakan'}
              </span>
            </div>
            
            <p className="font-bold text-primary-dark text-lg mb-2">{task.title || 'Judul Tugas'}</p>
            
            <div className="flex items-center gap-2 text-light text-xs mb-4">
              <Clock size={14} />
              <span>Tenggat: {task.due_date || '-'}</span>
            </div>

            {task.status !== 'Selesai' && (
              <div style={{ position: 'relative' }}>
                <button 
                  className="btn-primary" 
                  style={{ padding: '0.75rem', fontSize: '0.875rem' }} 
                  disabled={uploadingId === task.id}
                >
                  {uploadingId === task.id ? 'Mengunggah...' : 'Kumpulkan Tugas'}
                </button>
                <input 
                  type="file" 
                  multiple
                  onChange={(e) => handleFileUpload(e, task.id)}
                  style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '100%', 
                    opacity: 0, 
                    cursor: 'pointer' 
                  }}
                  disabled={uploadingId === task.id}
                />
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Tugas;
