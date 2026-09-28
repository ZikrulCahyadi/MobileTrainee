const fs = require('fs');
let data = fs.readFileSync('src/pages/Dashboard.jsx', 'utf8');

// 1. Remove the bottom block
const bottomBlockStart = '            {data.classInfo.is_passed && (';
const bottomBlockEnd = '            <div style={{ \r\n              backgroundColor: \'rgba(255,255,255,0.08)\',';
const bottomBlockEndLF = '            <div style={{ \n              backgroundColor: \'rgba(255,255,255,0.08)\',';

const startIndex = data.lastIndexOf(bottomBlockStart);
if (startIndex !== -1) {
  let endIndex = data.indexOf(bottomBlockEnd, startIndex);
  if (endIndex === -1) {
    endIndex = data.indexOf(bottomBlockEndLF, startIndex);
  }
  
  if (endIndex !== -1) {
    data = data.substring(0, startIndex) + data.substring(endIndex);
  }
}

// 2. Replace the top block
const topBlockRegex = /\{\s*data\.classInfo\s*&&\s*data\.classInfo\.is_passed\s*&&\s*\([\s\S]*?\}\)\s*\}/;

const newTopBlock = `        {data.classInfo && data.classInfo.is_passed && (
          <div className="card mb-6" style={{ 
            backgroundColor: '#ecfdf5', 
            border: '1px solid #10b981', 
            borderRadius: '12px', 
            padding: '1.25rem' 
          }}>
            <p className="text-sm mb-3 font-bold text-emerald-700" style={{ lineHeight: '1.5' }}>
              🎉 Selamat! Anda telah lulus pelatihan ini.
            </p>
            <button 
              onClick={handleDownloadCertificate}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                backgroundColor: '#10b981', padding: '0.875rem 1rem',
                borderRadius: '8px', border: 'none', color: 'white',
                cursor: 'pointer', transition: 'background-color 0.2s ease',
              }}
            >
              <div className="flex items-center gap-2">
                <BookOpen size={18} />
                <span className="font-semibold text-sm">Unduh Sertifikat Kelulusan</span>
              </div>
              <ArrowRight size={18} style={{ opacity: 0.9 }} />
            </button>
          </div>
        )}`;

data = data.replace(topBlockRegex, newTopBlock);

fs.writeFileSync('src/pages/Dashboard.jsx', data);
console.log('Fixed certificate blocks');
