const https = require('https');
https.get('https://expert-platform-production-626e.up.railway.app/index.html', r => {
  let d = '';
  r.on('data', c => d += c);
  r.on('end', () => {
    const scripts = d.match(/<script>([\s\S]*?)<\/script>/g);
    const m = scripts[1].match(/<script>([\s\S]*?)<\/script>/);
    const code = m[1];
    
    // Binary search for the exact position
    let lo = 0, hi = code.length;
    while (hi - lo > 1) {
      const mid = Math.floor((lo + hi) / 2);
      try {
        new Function(code.substring(0, mid));
        lo = mid;
      } catch (e) {
        hi = mid;
      }
    }
    // lo = last good, hi = first bad
    console.log('Last good pos:', lo, '=', JSON.stringify(code.substring(lo - 30, lo + 10)));
    console.log('First bad pos:', hi, '=', JSON.stringify(code.substring(hi - 5, hi + 20)));
    console.log('Error context:', code.substring(Math.max(0, hi - 100), hi + 100));
    process.exit(0);
  });
}).on('error', e => { console.log('Error:', e.message); process.exit(1); });