const fs = require('fs');
const p = 'C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html';
const html = fs.readFileSync(p, 'utf8');

const s = html.indexOf('<script', 1057);
const openEnd = html.indexOf('>', s) + 1;
const closeStart = html.lastIndexOf('</script>');
const code = html.substring(openEnd, closeStart);

// Try splitting at function boundaries to find the bad one
const funcMatches = [...code.matchAll(/function\s+\w+\s*\(/g)];
console.log('Found', funcMatches.length, 'functions');

// Try evaluating up to each function start
for (let i = 0; i < funcMatches.length; i++) {
  const pos = funcMatches[i].index;
  try {
    new Function(code.substring(0, pos));
  } catch(e) {
    const fname = code.substring(pos, pos+30);
    console.log('FAIL before function', i, 'at', pos, ':', fname);
    
    // Show context before this
    const ctxStart = Math.max(0, pos - 100);
    console.log('Context:', JSON.stringify(code.substring(ctxStart, pos + 50)));
    break;
  }
}
// Also check end
try {
  new Function(code);
  console.log('Full code OK');
} catch(e) {
  console.log('Full code ERROR:', e.message);
}
