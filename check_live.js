const https = require('https');
https.get('https://expert-platform-production-626e.up.railway.app/', r => {
  console.log('Status:', r.statusCode);
  let d = '';
  r.on('data', c => d += c);
  r.on('end', () => {
    console.log('HTML size:', d.length);
    console.log('Has app div:', d.includes('id="app"'));
    console.log('Script tags:', (d.match(/<script/g) || []).length);
    process.exit(0);
  });
}).on('error', e => { console.log('Error:', e.message); process.exit(1); });