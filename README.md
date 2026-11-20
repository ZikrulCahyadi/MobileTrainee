# FR Trainee Mobile App (PWA)

Aplikasi Web Progresif (PWA) untuk aktivitas peserta pelatihan/trainee First Resources, meliputi:
- **Dashboard**: Informasi sesi kelas pelatihan hari ini, status kehadiran, tugas tertunda, dan evaluasi pending.
- **Absensi**: Scan QR Code kamera dan input token manual untuk presensi kehadiran harian.
- **Tugas**: Pengumpulan file/foto tugas dengan kompresi gambar instan berbasis hardware canvas dan fitur batalkan pengumpulan.
- **Evaluasi**: Pengisian kuesioner evaluasi materi & trainer pelatihan dengan rating dan pesan kesan.
- **Profil**: Informasi akun trainee, ganti password, dan notifikasi push web.

---

## 🚀 Panduan Menjalankan Project

### 1. Prasyarat
- **Node.js** (versi 18 ke atas)
- **NPM** (bawaan Node.js)

### 2. Instalasi Dependensi
Buka terminal di folder project, lalu jalankan:
```bash
npm install
```

### 3. Konfigurasi Environment (`.env`)
File `.env` sudah disediakan secara default. Jika ingin mengubah URL API backend:
```env
VITE_API_BASE_URL="https://academy.first-resources.com/api"
VITE_VAPID_PUBLIC_KEY="BJDrI0qkguv4rbiEdEZeRW6LnGThFAg2D3_70UJnCOL4zUVzS9D5qiVIdiirXb6aK6GJsH8ubY3hZJDtQ09o42Q"
```

### 4. Menjalankan di Mode Development (Lokal)
```bash
npm run dev
```
Aplikasi akan aktif di `http://localhost:5173`.

### 5. Cek Kualitas & Kebersihan Kode (Linting)
```bash
npm run lint
```
*Pastikan tidak ada error atau warning sebelum melakukan commit.*

### 6. Build untuk Production (Vercel / Hosting)
```bash
npm run build
```
Hasil build akan berada di direktori `dist/` dan siap dideploy ke Vercel, Netlify, atau web server lainnya.

---

## 🛠️ Tech Stack
- **Framework:** React 19 + Vite 8
- **Routing:** React Router v7
- **HTTP Client:** Axios (timeout 30s)
- **Icon:** Lucide React
- **QR Scanner:** Html5-Qrcode
- **PWA:** Service Worker (`public/sw.js`)
