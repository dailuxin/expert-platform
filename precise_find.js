const https = require('https');
https.get('https://expert-platform-production-626e.up.railway.app/index.html', r => {
  let d = '';
  r.on('data', c => d += c);
  r.on('end', () => {
    const scripts = d.match(/<script>([\s\S]*?)<\/script>/g);
    const m = scripts[1].match(/<script>([\s\S]*?)<\/script>/);
    const code = m[1];
    
    // Binary search for the exact first error position
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
    const firstBad = hi;
    const lastGood = lo;
    console.log('Last good pos:', lastGood);
    console.log('First bad pos:', firstBad);
    
    // Show context around the boundary
    for (let i = Math.max(0, lastGood - 50); i < firstBad + 50; i++) {
      process.stdout.write('[' + i + ']' + code.charCodeAt(i) + ':' + JSON.stringify(code[i]) + '  ');
      if (i % 4 === 3) process.stdout.write('\n');
    }
    process.exit(0);
  });
}).on('error', e => { console.log('Error:', e.message); process.exit(1); });