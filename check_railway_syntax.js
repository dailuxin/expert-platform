const https = require('https');
https.get('https://expert-platform-production-626e.up.railway.app/index.html', r => {
  let d = '';
  r.on('data', c => d += c);
  r.on('end', () => {
    // Extract scripts
    const scripts = d.match(/<script>([\s\S]*?)<\/script>/g);
    console.log('Railway script blocks:', scripts ? scripts.length : 0);
    if (scripts) scripts.forEach((s, i) => {
      const m = s.match(/<script>([\s\S]*?)<\/script>/);
      if (m) {
        try {
          new Function(m[1]);
          console.log('Railway Script', i, 'OK, len:', m[1].length);
        } catch (e) {
          console.log('Railway Script', i, 'ERROR:', e.message);
          const match = e.message.match(/at position (\d+)/);
          if (match) {
            const pos = parseInt(match[1]);
            console.log('Context:', m[1].substring(Math.max(0, pos - 60), pos + 60));
          }
        }
      }
    });
    process.exit(0);
  });
}).on('error', e => { console.log('Error:', e.message); process.exit(1); });