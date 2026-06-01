const https = require('https');
https.get('https://expert-platform-production-626e.up.railway.app/api/me', r => {
  console.log('API status:', r.statusCode);
  r.on('data', c => process.stdout.write(c));
  r.on('end', () => { console.log(''); process.exit(0); });
}).on('error', e => { console.log('Error:', e.message); process.exit(1); });