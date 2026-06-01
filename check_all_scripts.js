const fs = require('fs');
const p = 'C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html';
const html = fs.readFileSync(p, 'utf8');

// Find ALL script blocks
let idx = 0;
while (true) {
  const s = html.indexOf('<script', idx);
  if (s < 0) break;
  const e = html.indexOf('</script>', s);
  const code = html.substring(s, e + 9).trim();
  const len = code.length;
  
  try {
    // Extract just the content
    const openTagEnd = code.indexOf('>');
    const content = code.substring(openTagEnd + 1, code.length - 9);
    if (content.length > 50) {
      new Function(content);
      console.log('Script at', s, 'len=' + len, 'content_len=' + content.length, '- OK');
    } else {
      console.log('Script at', s, 'len=' + len, '- small, skipped');
    }
  } catch(err) {
    const openTagEnd = code.indexOf('>');
    const content = code.substring(openTagEnd + 1, code.length - 9);
    let lo=0, hi=content.length;
    while(hi-lo>5){const m=Math.floor((lo+hi)/2);try{new Function(content.substring(0,m));lo=m}catch(e){hi=m}}
    console.log('Script at', s, 'len=' + len, '- ERROR:', err.message, 'near', lo, JSON.stringify(content.substring(Math.max(0,lo-40), lo+20)));
  }
  idx = e + 9;
}
