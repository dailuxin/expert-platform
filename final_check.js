const fs = require('fs');
const p = 'C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html';
const html = fs.readFileSync(p, 'utf8');

// Extract main script
const s = html.indexOf('<script', 1057);
const openEnd = html.indexOf('>', s) + 1;
const closeStart = html.lastIndexOf('</script>');
const code = html.substring(openEnd, closeStart);

// Write to temp file and check
fs.writeFileSync(p + '.full_test.js', code, 'utf8');
const { execSync } = require('child_process');
try {
  execSync(`node --check "${p}.full_test.js"`, { encoding: 'utf8' });
  console.log('FULL SYNTAX OK!');
} catch(e) {
  const err = e.stderr || '';
  console.log('ERROR:', err.substring(0, 500));
  
  // The error points to line 13. Let's see what line 13 actually is
  const lines = code.split('\n');
  console.log('\n--- Line 13 (first 300 chars) ---');
  console.log(lines[12].substring(0, 300));
}
