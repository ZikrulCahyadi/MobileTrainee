import axios from 'axios';

// Mock data untuk akun dummy (NIK 123)
const DUMMY_TRAINEE = {
    id: 999,
    nik: '123',
    name: 'Test Peserta',
    program: 'Managerial & Leadership',
    batch: 'Batch 2026',
    universitas: 'Universitas Indonesia',
    jurusan: 'Manajemen Bisnis',
    asal_daerah: 'Jakarta',
    email: 'testpeserta@first-resources.com',
    phone: '081234567890'
};

const defaultAdapter = axios.getAdapter ? axios.getAdapter(axios.defaults.adapter) : axios.defaults.adapter;

// Konfigurasi dasar untuk koneksi ke backend Laravel
const api = axios.create({
    baseURL: 'https://fr-academy.my.id/api', 
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    adapter: async (config) => {
        const token = localStorage.getItem('auth_token');
        const isDummy = token === 'dummy-token-123';

        // Tangani endpoint login dummy jika NIK = 123
        if (config.url?.includes('/trainee/login')) {
            try {
                const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
                if (body && String(body.nik).trim() === '123') {
                    return {
                        data: {
                            status: 'success',
                            message: 'Login berhasil (Akun Dummy)',
                            token: 'dummy-token-123',
                            trainee: DUMMY_TRAINEE
                        },
                        status: 200,
                        statusText: 'OK',
                        headers: {},
                        config
                    };
                }
            } catch (e) {
                // pass through to default
            }
        }

        // Jika user sedang login dengan akun dummy
        if (isDummy) {
            const url = config.url || '';
            let mockData = null;

            if (url.includes('/trainee/dashboard')) {
                mockData = {
                    status: 'success',
                    data: {
                        todayAttendance: false,
                        pendingTasks: 1,
                        pendingEvaluations: 1,
                        trainee: DUMMY_TRAINEE,
                        todayClass: 'High Impact Communication',
                        classInfo: {
                            id: 1,
                            subject: 'High Impact Communication',
                            trainer: 'Nama Trainer',
                            trainer_name: 'Nama Trainer',
                            start_time: '08:00',
                            end_time: '16:00',
                            room: 'Ruang Leadership A',
                            date: new Date().toISOString().split('T')[0]
                        }
                    }
                };
            } else if (url.includes('/trainee/profile')) {
                mockData = {
                    status: 'success',
                    data: DUMMY_TRAINEE
                };
            } else if (url.includes('/trainee/evaluations/pending')) {
                mockData = {
                    status: 'success',
                    data: [
                        {
                            id: 101,
                            date: new Date().toISOString().split('T')[0],
                            materi: 'High Impact Communication',
                            trainer: 'Nama Trainer',
                            status: 'pending'
                        }
                    ]
                };
            } else if (url.includes('/trainee/evaluations/')) {
                mockData = {
                    status: 'success',
                    message: 'Evaluasi berhasil dikirim (Akun Dummy).'
                };
            } else if (url.includes('/trainee/tasks') && config.method?.toLowerCase() === 'get') {
                mockData = {
                    status: 'success',
                    data: [
                        {
                            id: 201,
                            title: 'Resume Materi High Impact Communication',
                            description: 'Buat resume materi High Impact Communication mengenai teknik komunikasi efektif, persuasif, dan assertive leadership minimal 2 halaman dalam format PDF.',
                            deadline: '2026-10-15 23:59:00',
                            status: 'pending',
                            submitted_at: null,
                            file_path: null
                        }
                    ]
                };
            } else if (url.includes('/trainee/tasks/') && config.method?.toLowerCase() === 'post') {
                mockData = {
                    status: 'success',
                    message: 'Tugas berhasil dikumpulkan (Akun Dummy).'
                };
            } else if (url.includes('/trainee/tasks/') && config.method?.toLowerCase() === 'delete') {
                mockData = {
                    status: 'success',
                    message: 'Pengumpulan tugas berhasil dibatalkan (Akun Dummy).'
                };
            } else if (url.includes('/trainee/attendances')) {
                mockData = {
                    status: 'success',
                    data: [
                        {
                            id: 301,
                            date: '2026-10-11',
                            status: 'Hadir',
                            time_in: '07:55:00',
                            notes: 'Tepat waktu'
                        }
                    ]
                };
            } else if (url.includes('/trainee/submit-attendance')) {
                mockData = {
                    status: 'success',
                    message: 'Absensi berhasil dicatat (Akun Dummy).'
                };
            } else if (url.includes('certificate')) {
                const dummyBlob = new Blob(['Dummy Certificate Content'], { type: 'application/pdf' });
                return {
                    data: dummyBlob,
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config
                };
            } else {
                mockData = {
                    status: 'success',
                    data: {}
                };
            }

            return {
                data: mockData,
                status: 200,
                statusText: 'OK',
                headers: {},
                config
            };
        }

        return defaultAdapter(config);
    }
});

// Interceptor untuk menyisipkan Token (Sanctum) otomatis ke setiap request
api.interceptors.request.use(
    (config) => {
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
            const token = localStorage.getItem('auth_token');
            if (token !== 'dummy-token-123') {
                localStorage.removeItem('auth_token');
            }
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
