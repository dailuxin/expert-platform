const fs = require('fs');
const p = 'C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html';
const html = fs.readFileSync(p, 'utf8');

const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
let match;
while ((match = scriptRegex.exec(html)) !== null) {
  const code = match[1].trim();
  if (code && code.length > 10000) {
    // Binary search
    let lo = 900, hi = 1100;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      try {
        new Function(code.substring(0, mid));
        lo = mid + 1;
      } catch (e) {
        hi = mid;
      }
    }
    console.log('First error at char:', lo);
    console.log('Context:', JSON.stringify(code.substring(lo - 20, lo + 20)));
    console.log('Line num approx:', code.substring(0, lo).split('\n').length);
  }
}
