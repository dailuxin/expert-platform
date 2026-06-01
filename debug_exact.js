const fs = require('fs');
const h = fs.readFileSync('C:/Users/dailu/Desktop/expert-platform/public/index.html', 'utf8');
const scripts = h.match(/<script>([\s\S]*?)<\/script>/g);
const m = scripts[1].match(/<script>([\s\S]*?)<\/script>/);
const code = m[1];

// Binary search for error
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
const lastGood = lo;
const firstBad = hi;
console.log('Last good pos:', lastGood);
console.log('First bad pos:', firstBad);
console.log('Around boundary:');
for (let i = Math.max(0, lastGood - 5); i < firstBad + 5; i++) {
  process.stdout.write('[' + i + ']' + code.charCodeAt(i) + ':' + JSON.stringify(code[i]) + ' ');
}
console.log('');

// Check first 200 chars
console.log('\nFirst 200 chars:');
console.log(JSON.stringify(code.substring(0, 200)));
process.exit(0);