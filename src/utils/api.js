import axios from 'axios';

// Konfigurasi dasar untuk koneksi ke backend Laravel API
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://academy.first-resources.com/api', 
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

// Interceptor untuk menyisipkan Token (Sanctum) otomatis ke setiap request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            if (config.headers && typeof config.headers.set === 'function') {
                config.headers.set('Authorization', `Bearer ${token}`);
            } else {
                config.headers = config.headers || {};
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        // Jika data adalah FormData, hapus Content-Type bawaan agar browser otomatis membuat multipart boundary
        if (config.data instanceof FormData) {
            if (config.headers && typeof config.headers.delete === 'function') {
                config.headers.delete('Content-Type');
            } else if (config.headers) {
                delete config.headers['Content-Type'];
                delete config.headers['content-type'];
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor untuk menangani error secara global (misal: Token Expired)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('trainee_data');
        }
        return Promise.reject(error);
    }
);

// --- DAFTAR FUNGSI API ---

export const login = async (nik) => {
    const response = await api.post('/trainee/login', { nik: nik });
    // Simpan token ke localStorage setelah berhasil login
    if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
};

export const fetchDashboard = async () => {
    const response = await api.get('/trainee/dashboard');
    return response.data;
};

export const fetchProfile = async () => {
    const response = await api.get('/trainee/profile');
    return response.data;
};

export const fetchTasks = async () => {
    const response = await api.get('/trainee/tasks');
    return response.data;
};

export const submitTask = async (id, formData) => {
    const response = await api.post(`/trainee/tasks/${id}/submit`, formData);
    return response.data;
};

export const deleteTaskSubmission = async (id) => {
    const response = await api.delete(`/trainee/tasks/${id}/submit`);
    return response.data;
};

export const fetchAttendances = async () => {
    const response = await api.get('/trainee/attendances');
    return response.data;
};

export const submitAttendance = async (qrCode) => {
    const token = typeof qrCode === 'string' ? qrCode.trim() : '';
    const response = await api.post('/trainee/submit-attendance', { 
        qr_token: token,
        qr_code: token 
    });
    return response.data;
};

export const getPendingEvaluations = async () => {
    const response = await api.get('/trainee/evaluations/pending');
    return response.data;
};

export const submitEvaluation = async (dailyClassId, data) => {
    const response = await api.post(`/trainee/evaluations/${dailyClassId}`, data);
    return response.data;
};

export default api;
