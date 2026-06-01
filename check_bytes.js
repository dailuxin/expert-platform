const fs = require('fs');
const h = fs.readFileSync('C:/Users/dailu/Desktop/expert-platform/public/index.html', 'utf8');
const scripts = h.match(/<script>([\s\S]*?)<\/script>/g);
const m = scripts[1].match(/<script>([\s\S]*?)<\/script>/);
const code = m[1];

// Check the exact content at positions 98-110
console.log('Chars 98-110:');
for (let i = 98; i < 112; i++) {
  process.stdout.write('[' + i + ']=' + code.charCodeAt(i) + '=' + JSON.stringify(code[i]) + ' ');
}
console.log('');

// Find the semicolon that ends the global vars line
const firstSemi = code.indexOf(';');
console.log('First semicolon at:', firstSemi);
console.log('Before semi:', JSON.stringify(code.substring(0, firstSemi + 1)));
console.log('After semi first 50:', JSON.stringify(code.substring(firstSemi + 1, firstSemi + 51)));

// Now check if the line BEFORE the ; has an issue
const lineBeforeSemi = code.substring(0, firstSemi);
console.log('Line before semicolon:', JSON.stringify(lineBeforeSemi));

// Check: does the file have a BOM from Railway's previous version?
// Look at what Railway actually has at byte 0-3
console.log('\nActual file bytes (hex) first 10:');
const buf = Buffer.from(h.substring(h.indexOf('<script>') + 8, h.indexOf('</script>')));
console.log(buf.slice(0, 10).toString('hex'));

process.exit(0);