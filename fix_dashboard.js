const fs = require('fs');
let data = fs.readFileSync('src/pages/Dashboard.jsx', 'utf8');

const replacement = `              <div className="flex items-center gap-3" style={{ gridColumn: '1 / -1' }}>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', padding: '10px', borderRadius: '10px' }}>
                  <Calendar size={18} />
                </div>
                <div className="flex flex-col">
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7, marginBottom: '2px' }}>Tanggal</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                    {data.classInfo.date ? new Date(data.classInfo.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'} 
                    {data.classInfo.end_date && data.classInfo.end_date !== data.classInfo.date ? \` - \${new Date(data.classInfo.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}\` : ''}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', padding: '10px', borderRadius: '10px' }}>
                  <Clock size={18} />
                </div>
                <div className="flex flex-col">
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7, marginBottom: '2px' }}>Waktu</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                    {data.classInfo.start_time ? data.classInfo.start_time.substring(0,5) : '-'} {data.classInfo.end_time ? \`- \${data.classInfo.end_time.substring(0,5)}\` : ''}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', padding: '10px', borderRadius: '10px' }}>
                  <MapPin size={18} />
                </div>
                <div className="flex flex-col">
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7, marginBottom: '2px' }}>Lokasi</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>FR Academy</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', padding: '10px', borderRadius: '10px' }}>
                  <Home size={18} />
                </div>
                <div className="flex flex-col">
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7, marginBottom: '2px' }}>Ruangan</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                    {data.classInfo.room ? data.classInfo.room.replace(/^FR Academy\\s*\\/\\s*/i, '') : 'TBA'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', padding: '10px', borderRadius: '10px' }}>
                  <User size={18} />
                </div>
                <div className="flex flex-col">
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7, marginBottom: '2px' }}>Instruktur</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                    {data.classInfo.trainer_name || 'TBA'}
                  </span>
                </div>
              </div>
            </div>`;

// We just find the grid block and replace the children
const startIndex = data.indexOf('<div className="flex items-start gap-2" style={{ gridColumn: \\'1 / -1\\' }}>');
const endIndex = data.indexOf('<div style={{ \r\n              backgroundColor: \\'rgba(255,255,255,0.08)\\',');

if (startIndex !== -1 && endIndex !== -1) {
  data = data.substring(0, startIndex) + replacement + "\n            " + data.substring(endIndex);
  fs.writeFileSync('src/pages/Dashboard.jsx', data);
  console.log("Success");
} else {
  // Try alternative for end index if crlf issues
  const endIndex2 = data.indexOf('<div style={{ \n              backgroundColor: \\'rgba(255,255,255,0.08)\\',');
  if (startIndex !== -1 && endIndex2 !== -1) {
    data = data.substring(0, startIndex) + replacement + "\n            " + data.substring(endIndex2);
    fs.writeFileSync('src/pages/Dashboard.jsx', data);
    console.log("Success (LF)");
  } else {
    console.log("Failed to find indices", startIndex, endIndex);
  }
}
