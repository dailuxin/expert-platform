const fs = require('fs');
const h = fs.readFileSync('C:/Users/dailu/Desktop/expert-platform/public/index.html', 'utf8');
const scripts = h.match(/<script>([\s\S]*?)<\/script>/g);
const m = scripts[1].match(/<script>([\s\S]*?)<\/script>/);
const code = m[1];

// Try parsing different chunks to narrow down the real error
const chunks = [
  [0, 500],
  [500, 1000],
  [1000, 2000],
  [2000, 5000],
  [5000, 10000],
  [10000, 20000],
  [20000, 30000],
  [30000, 42039],
];

chunks.forEach(([from, to]) => {
  try {
    new Function(code.substring(from, to));
    console.log(`Chunk ${from}-${to}: OK`);
  } catch(e) {
    console.log(`Chunk ${from}-${to} ERROR:`, e.message.substring(0, 100));
  }
});

// Also try with 10-char increments around the binary search result
console.log('\n--- Fine-grained search around binary split ---');
for (let i = 95; i < 120; i++) {
  try {
    new Function(code.substring(0, i));
  } catch(e) {
    if (e.message.includes('Unexpected identifier')) {
      console.log(`Error at pos ${i}: ${e.message}`);
      console.log(`Context: ${JSON.stringify(code.substring(Math.max(0, i-30), i+30))}`);
      break;
    }
  }
}

process.exit(0);