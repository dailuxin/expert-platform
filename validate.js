const fs = require('fs');
const p = 'C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html';
const html = fs.readFileSync(p, 'utf8');

const s = html.indexOf('<script', 1057);
const openEnd = html.indexOf('>', s) + 1;
const closeStart = html.lastIndexOf('</script>');
const code = html.substring(openEnd, closeStart);

// Try vm.Script instead
try {
  const vm = require('vm');
  new vm.Script(code);
  console.log('vm.Script: OK');
} catch(e) {
  console.log('vm.Script ERROR:', e.message);
}

// Try writing to temp file and requiring it (just syntax check)
fs.writeFileSync(p + '.test.js', code, 'utf8');
try {
  require('child_process').execSync(`node --check "${p}.test.js"`, { encoding: 'utf8' });
  console.log('node --check: OK');
} catch(e) {
  console.log('node --check ERROR:', e.stderr || e.message);
}
