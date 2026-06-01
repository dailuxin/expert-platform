const fs = require('fs');
const p = 'C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html';
let html = fs.readFileSync(p, 'utf8');

// Bug 1: <option value=\">  in renderHome (industry filter "全部行业")
const bug1 = 'value=\\">全部行业</option>';
if (html.includes(bug1)) {
  html = html.replace(bug1, 'value=\"\">全部行业</option>');
  console.log('Fixed bug 1: industry option value');
}

// Also check for the pattern in raw form
const bug1alt = '<option value=\">全部行业';
if (html.includes(bug1alt)) {
  html = html.replaceAll(bug1alt, '<option value="">全部行业');
  console.log('Fixed bug 1 (alt)');
}

// Validate
const s = html.indexOf('<script', 1057);
const openEnd = html.indexOf('>', s) + 1;
const closeStart = html.lastIndexOf('</script>');
const code = html.substring(openEnd, closeStart);
fs.writeFileSync(p + '.test.js', code, 'utf8');

try {
  require('child_process').execSync(`node --check "${p}.test.js"`, { encoding: 'utf8' });
  console.log('Syntax OK!');
} catch(e) {
  console.log('Still ERROR:', e.stderr ? e.stderr.substring(0, 200) : e.message);
}

fs.writeFileSync(p, html, 'utf8');
console.log('Saved');
