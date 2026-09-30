import axios from 'axios';

// Konfigurasi dasar untuk koneksi ke backend Laravel
const api = axios.create({
    // Sesuaikan baseURL dengan URL lokal Laravel Anda (biasanya https://fr-academy.my.id)
    // Gunakan IP Address komputer (misal: http://192.168.1.5:8000/api) jika Anda mengetesnya lewat HP/Emulator
    
    // URL PRODUCTION
    baseURL: 'https://fr-academy.my.id/api', 

    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Interceptor untuk menyisipkan Token (Sanctum) otomatis ke setiap request
api.interceptors.request.use(
    (config) => {
        // Ambil token dari localStorage (atau state management seperti Redux/Zustand)
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
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
            // Jika token tidak valid / kadaluarsa, otomatis logout
            localStorage.removeItem('auth_token');
            // Opsional: Redirect ke halaman login
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// --- DAFTAR FUNGSI API ---

export const login = async (nik) => {
    const response = await api.post('/trainee/login', { nik: nik });
    // Simpan token ke localStorage setelah berhasil login
    localStorage.setItem('auth_token', response.data.token);
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
    const response = await api.post(`/trainee/tasks/${id}/submit`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    });
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
    const response = await api.post('/trainee/submit-attendance', { qr_code: qrCode });
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
