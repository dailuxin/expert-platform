const https = require('https');
https.get('https://expert-platform-production-626e.up.railway.app/index.html', r => {
  let d = '';
  r.on('data', c => d += c);
  r.on('end', () => {
    process.stdout.write('Status: ' + r.statusCode + ' Size: ' + d.length + '\n');
    const start = d.indexOf('async function renderVerification');
    if (start === -1) {
      process.stdout.write('renderVerification NOT FOUND in Railway HTML!\n');
    } else {
      const chunk = d.substring(Math.max(0, start - 50), start + 600);
      process.stdout.write('Found at offset: ' + start + '\n');
      process.stdout.write('Context: ' + chunk + '\n');
    }
    process.exit(0);
  });
}).on('error', e => { process.stdout.write('Error: ' + e.message + '\n'); process.exit(1); });