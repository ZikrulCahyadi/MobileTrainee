const fs = require('fs');

let data = fs.readFileSync('src/pages/Dashboard.jsx', 'utf8');

// 1. Remove the old certificate block
const regexOldBlock = /\{\s*data\.classInfo\.is_passed\s*&&\s*\([\s\S]*?\}\)\s*\}/;
data = data.replace(regexOldBlock, '');

// 2. Wrap the schedule card rendering inside a Fragment, and place the new certificate card above it
const newCertCard = `
        {data.classInfo && data.classInfo.is_passed && (
          <div className="card mb-4" style={{ padding: '1.25rem', border: '2px solid #10b981', backgroundColor: '#f0fdf4' }}>
            <div className="flex items-center gap-3 mb-3">
              <div style={{ backgroundColor: '#10b981', padding: '0.5rem', borderRadius: '50%', color: 'white', display: 'flex' }}>
                <CheckCircle size={24} />
              </div>
              <h3 className="font-bold text-primary-dark text-lg">Selamat! Anda Lulus</h3>
            </div>
            <p className="text-sm text-primary-dark mb-4" style={{ opacity: 0.85 }}>
              Anda telah berhasil menyelesaikan pelatihan ini dan memenuhi syarat kelulusan.
            </p>
            <button 
              onClick={handleDownloadCertificate}
              className="btn-primary"
              style={{ width: '100%', backgroundColor: '#10b981', color: 'white', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '0.875rem', borderRadius: '10px' }}
            >
              <BookOpen size={18} />
              Unduh Sertifikat Kelulusan
            </button>
          </div>
        )}

        {data.classInfo ? (`;

data = data.replace('{data.classInfo ? (', newCertCard);

fs.writeFileSync('src/pages/Dashboard.jsx', data);
console.log('Success moving certificate card');
