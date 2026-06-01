const fs = require('fs');
const p = 'C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html';
let html = fs.readFileSync(p, 'utf8');

// Find exact bytes of the problematic pattern
const target = 'value=\"\">全部行业';
const idx = html.indexOf(target);
console.log('Target found at', idx);
if (idx >= 0) {
  // Show hex dump
  const chunk = html.substring(idx, idx + 20);
  console.log('Hex:', Buffer.from(chunk).toString('hex'));
  console.log('JSON:', JSON.stringify(chunk));
}

// The issue: replaceAll searches for literal string
// In file: value=\"\">  (6 chars: \ " " >)
// My search: value=\"\">  should match...
// Let me try a different approach - use regex

let count = 0;
html = html.replace(/value="">/g, () => { count++; return 'value=\\"">'; });
console.log('Regex replaced', count, 'occurrences of value=""');

count = 0;
// Also check for the unescaped version that might be there
html = html.replace(/value="">(全部|不限)/g, (_, label) => { count++; return `value=\\"">${label}`; });
console.log('Regex2 replaced', count, 'occurrences');

// Validate
const s = html.indexOf('<script', 1057);
const openEnd = html.indexOf('>', s) + 1;
const closeStart = html.lastIndexOf('</script>');
const code = html.substring(openEnd, closeStart);
fs.writeFileSync(p + '.v2_test.js', code, 'utf8');
try {
  require('child_process').execSync(`node --check "${p}.v2_test.js"`, { encoding: 'utf8' });
  console.log('✅ SYNTAX OK!');
} catch(e) {
  console.log('❌ ERROR:', (e.stderr || '').substring(0, 200));
}

fs.writeFileSync(p, html, 'utf8');
console.log('Saved');
