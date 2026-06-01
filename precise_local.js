const fs = require('fs');
const h = fs.readFileSync('C:/Users/dailu/Desktop/expert-platform/public/index.html', 'utf8');
const scripts = h.match(/<script>([\s\S]*?)<\/script>/g);
const m = scripts[1].match(/<script>([\s\S]*?)<\/script>/);
const code = m[1];

// Binary search
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
console.log('Last good:', lo, '| First bad:', hi);
console.log('Char at first bad:', code.charCodeAt(hi), JSON.stringify(code[hi]));

// Show the exact split
console.log('Last good:', JSON.stringify(code.substring(lo - 20, lo + 5)));
console.log('First bad:', JSON.stringify(code.substring(hi - 5, hi + 20)));

// What function is at hi?
const snippet = code.substring(Math.max(0, hi - 200), hi + 100);
console.log('\nSnippet around error:');
for (const line of snippet.split('\n')) {
  console.log(JSON.stringify(line));
}
process.exit(0);