const fs = require('fs');
let data = fs.readFileSync('src/pages/Dashboard.jsx', 'utf8');

// Find the start and end precisely using simple string searching
const startIndex = data.indexOf("<div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.8rem', marginBottom: '1.25rem' }}>");
const endIndexStr = "            <div style={{ \r\n              backgroundColor: 'rgba(255,255,255,0.08)',";
const endIndexStrLF = "            <div style={{ \n              backgroundColor: 'rgba(255,255,255,0.08)',";

let endIndex = data.indexOf(endIndexStr);
if (endIndex === -1) endIndex = data.indexOf(endIndexStrLF);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div className="flex items-center gap-3" style={{ gridColumn: '1 / -1' }}>
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
            </div>
`;
  data = data.substring(0, startIndex) + replacement + data.substring(endIndex);
  fs.writeFileSync('src/pages/Dashboard.jsx', data);
  console.log("SUCCESS");
} else {
  console.log("FAILED", startIndex, endIndex);
}
