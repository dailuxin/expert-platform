const fs = require('fs');
const p = String.raw`C:\Users\dailu\Desktop\expert-platform\public\index.html`;
const html = fs.readFileSync(p, 'utf8');

// Extract all script blocks and check syntax
const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let idx = 0;
while ((match = scriptRegex.exec(html)) !== null) {
  const code = match[1].trim();
  if (code && code.length > 10) {
    try {
      new Function(code);
      console.log(`Script ${idx} OK (${code.length} chars)`);
    } catch (e) {
      console.log(`Script ${idx} ERROR: ${e.message} (${code.length} chars)`);
      // Show first line with error
      const lines = code.split('\n');
      console.log('First 3 lines:', lines.slice(0, 3).join('\n'));
    }
  }
  idx++;
}
