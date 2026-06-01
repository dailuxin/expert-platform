const fs = require('fs');
const p = 'C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html';
let html = fs.readFileSync(p, 'utf8');

// Find the error
const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
let match;
while ((match = scriptRegex.exec(html)) !== null) {
  const code = match[1].trim();
  if (code && code.length > 10000) {
    try {
      new Function(code);
      console.log('Script OK');
    } catch (e) {
      console.log('Error:', e.message);
      // Binary search for error location
      let lo = 0, hi = code.length;
      while (hi - lo > 10) {
        const mid = Math.floor((lo + hi) / 2);
        try { new Function(code.substring(0, mid)); lo = mid; }
        catch (e) { hi = mid; }
      }
      console.log('Error near position', lo, ':', JSON.stringify(code.substring(Math.max(0, lo - 30), lo + 30)));
    }
  }
}
