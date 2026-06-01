const fs = require('fs');
const https = require('https');
https.get('https://expert-platform-production-626e.up.railway.app/index.html', r => {
  let d = '';
  r.on('data', c => d += c);
  r.on('end', () => {
    const scripts = d.match(/<script>([\s\S]*?)<\/script>/g);
    const m = scripts[1].match(/<script>([\s\S]*?)<\/script>/);
    const code = m[1];
    const line1 = code.split('\n')[0];
    console.log('Line 1 length:', line1.length);
    console.log('Line 1:', JSON.stringify(line1));
    
    // Test: what if we remove the first line entirely?
    const rest = code.substring(code.indexOf('\n') + 1);
    try {
      new Function(rest);
      console.log('Rest is OK!');
    } catch(e) {
      console.log('Rest still error:', e.message);
      // Binary search on rest
      let lo = 0, hi = rest.length;
      while (hi - lo > 1) {
        const mid = Math.floor((lo + hi) / 2);
        try {
          new Function(rest.substring(0, mid));
          lo = mid;
        } catch (e) {
          hi = mid;
        }
      }
      console.log('Error at rest pos:', hi, '=', JSON.stringify(rest.substring(hi - 5, hi + 30)));
    }
    
    // Test: does the first line itself parse?
    try {
      new Function(line1);
      console.log('Line 1 parses OK');
    } catch(e) {
      console.log('Line 1 ERROR:', e.message);
    }
    
    process.exit(0);
  });
}).on('error', e => { console.log('Error:', e.message); process.exit(1); });