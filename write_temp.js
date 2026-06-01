const fs = require('fs');
const h = fs.readFileSync('C:/Users/dailu/Desktop/expert-platform/public/index.html', 'utf8');
const scripts = h.match(/<script>([\s\S]*?)<\/script>/g);
const m = scripts[1].match(/<script>([\s\S]*?)<\/script>/);
const mainScript = m[1];

// Write to temp file to preserve original formatting
fs.writeFileSync('C:/Users/dailu/Desktop/expert-platform/temp_test.js', mainScript, 'utf8');
console.log('Written temp_test.js, size:', mainScript.length);

// Now test with Node's actual parser
try {
  require.resolve('vm');
  const vm = require('vm');
  const script = new vm.Script(mainScript, { filename: 'test.js' });
  console.log('vm.Script: OK');
} catch(e) {
  console.log('vm.Script error:', e.message);
}

// Also test with acorn-like approach
try {
  // Test incremental parsing
  for (let i = 1; i < mainScript.length; i++) {
    try {
      new Function(mainScript.substring(0, i));
    } catch(e) {
      if (e.message.includes('Unexpected identifier')) {
        console.log('Error at:', i, JSON.stringify(mainScript.substring(Math.max(0,i-30),i+30)));
        // Check what's at error pos
        console.log('Char:', mainScript.charCodeAt(i), JSON.stringify(mainScript[i]));
        console.log('After:', JSON.stringify(mainScript.substring(i, i+20)));
        // What's the statement context?
        const lastSemi = mainScript.lastIndexOf(';', i);
        const stmt = mainScript.substring(Math.max(0, lastSemi + 1), i + 1);
        console.log('Partial statement:', JSON.stringify(stmt));
        break;
      }
    }
  }
} catch(e) {
  console.log('Loop error:', e.message);
}

process.exit(0);