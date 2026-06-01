const fs = require('fs');
const h = fs.readFileSync('C:/Users/dailu/Desktop/expert-platform/public/index.html', 'utf8');
const scripts = h.match(/<script>([\s\S]*?)<\/script>/g);
const m = scripts[1].match(/<script>([\s\S]*?)<\/script>/);
const code = m[1];

// Test with Node vm (uses same engine)
const vm = require('vm');
try {
  new vm.Script(code, { filename: 'test.js', displayErrors: true });
  console.log('vm.Script: OK');
} catch(e) {
  console.log('vm.Script error:', e.message);
  // Check if it gives a line number
  console.log('Error stack:', e.stack);
}

// Also check with esprima or try a different approach
// What if we look for the REAL syntax issue by checking what's in the HTML
// between the two script tags

// Extract BOTH scripts
const bothScripts = h.match(/<script>([\s\S]*?)<\/script>/g);
console.log('\nBoth script contents:');
bothScripts.forEach((s, i) => {
  console.log('\n--- Script', i, '---');
  console.log('Length:', s.length);
  const inner = s.match(/<script>([\s\S]*?)<\/script>/);
  if (inner) {
    console.log('First 100:', JSON.stringify(inner[1].substring(0, 100)));
    console.log('Last 100:', JSON.stringify(inner[1].slice(-100)));
  }
});

// Check if there's something between scripts
const scriptEnds = [];
let searchPos = 0;
while (true) {
  const idx = h.indexOf('</script>', searchPos);
  if (idx === -1) break;
  scriptEnds.push(idx + 9);
  searchPos = idx + 9;
}
console.log('\nScript tag end positions:', scriptEnds);
if (scriptEnds.length >= 1) {
  console.log('Between script 1 end and script 2 start:', JSON.stringify(h.substring(scriptEnds[0], scriptEnds[1])));
}

process.exit(0);