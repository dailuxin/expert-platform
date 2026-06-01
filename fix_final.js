const fs = require('fs');
const p = 'C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html';
let html = fs.readFileSync(p, 'utf8');

// Fix: value="" -> value=\"\" (escape the inner double quotes for JS string)
// The file has literal "" which breaks the JS string parsing
html = html.replaceAll('value="">全部行业', 'value=\"\">全部行业');
html = html.replaceAll('value="">不限', 'value=\"\">不限');

// Verify fix
console.log('After fix:');
let searchFrom = 0;
while (true) {
  const i = html.indexOf('option value', searchFrom);
  if (i < 0) break;
  console.log(`  @${i}: ${JSON.stringify(html.substring(i, i+20))}`);
  searchFrom = i + 1;
}

// Validate syntax
const s = html.indexOf('<script', 1057);
const openEnd = html.indexOf('>', s) + 1;
const closeStart = html.lastIndexOf('</script>');
const code = html.substring(openEnd, closeStart);
fs.writeFileSync(p + '.final_test.js', code, 'utf8');

try {
  require('child_process').execSync(`node --check "${p}.final_test.js"`, { encoding: 'utf8' });
  console.log('\n✅ SYNTAX OK!');
} catch(e) {
  console.log('\n❌ Still ERROR:', (e.stderr || '').substring(0, 300));
}

fs.writeFileSync(p, html, 'utf8');
console.log('\nSaved');
