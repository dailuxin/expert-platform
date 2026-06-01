const fs = require('fs');
const p = 'C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html';
const html = fs.readFileSync(p, 'utf8');

// Extract just renderHome function and check it in isolation
const s = html.indexOf('<script', 1057);
const openEnd = html.indexOf('>', s) + 1;
const closeStart = html.lastIndexOf('</script>');
const code = html.substring(openEnd, closeStart);

// Find renderHome
const rStart = code.indexOf('function renderHome');
const rEnd = code.indexOf('function filterByIndustry');
const renderHomeCode = code.substring(rStart, rEnd);

console.log('Testing renderHome in isolation...');
fs.writeFileSync(p + '.rh_test.js', renderHomeCode, 'utf8');
try {
  require('child_process').execSync(`node --check "${p}.rh_test.js"`, { encoding: 'utf8' });
  console.log('renderHome: OK');
} catch(e) {
  console.log('renderHome ERROR:', e.stderr ? e.stderr.substring(0, 300) : e.message);
}
