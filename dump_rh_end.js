const fs = require('fs');
const p = 'C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html';
const html = fs.readFileSync(p, 'utf8');

const s = html.indexOf('<script', 1057);
const openEnd = html.indexOf('>', s) + 1;
const closeStart = html.lastIndexOf('</script>');
const code = html.substring(openEnd, closeStart);

// Find renderHome end - look for loadHomeExtras call
const lheIdx = code.indexOf('function loadHomeExtras');
console.log('renderHome end (300 chars before loadHomeExtras):');
console.log(JSON.stringify(code.substring(lheIdx - 300, lheIdx)));
