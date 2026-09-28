const fs = require('fs');
let data = fs.readFileSync('src/pages/Dashboard.jsx', 'utf8');

const targetStr = "            </div>\r\n            <div style={{ \r\n              backgroundColor: 'rgba(255,255,255,0.08)',";
const targetStrLF = "            </div>\n            <div style={{ \n              backgroundColor: 'rgba(255,255,255,0.08)',";

const replacement = `            </div>
            
            <a 
              href={data.classInfo.lms_url || "https://lms.fr-academy.my.id"} 
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                backgroundColor: 'var(--accent)',
                color: 'var(--primary-dark)',
                padding: '0.875rem',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: 'bold',
                marginBottom: '1rem',
                marginTop: '1rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              <BookOpen size={20} />
              Buka LMS
            </a>
            
            <div style={{ \n              backgroundColor: 'rgba(255,255,255,0.08)',`;

if (data.includes(targetStr)) {
  fs.writeFileSync('src/pages/Dashboard.jsx', data.replace(targetStr, replacement.replace(/\n/g, '\r\n')));
} else if (data.includes(targetStrLF)) {
  fs.writeFileSync('src/pages/Dashboard.jsx', data.replace(targetStrLF, replacement));
}
