const https = require('https');
const urls = [
  '/packages.js',
  '/rating.js',
  '/push.js',
  '/schedule.js',
  '/booking_slots.js',
  '/sw.js'
];
let done = 0;
urls.forEach(f => {
  https.get('https://expert-platform-production-626e.up.railway.app' + f, r => {
    let d = '';
    r.on('data', c => d += c);
    r.on('end', () => {
      console.log(f, 'Status:', r.statusCode, 'Size:', d.length);
      if (d.length < 500) console.log('Content:', d.substring(0, 200));
      done++;
      if (done === urls.length) process.exit(0);
    });
  }).on('error', e => {
    console.log(f, 'Error:', e.message);
    done++;
    if (done === urls.length) process.exit(0);
  });
});
setTimeout(() => { console.log('Timeout'); process.exit(1); }, 15000);