const https = require('https');
https.get('https://expert-platform-production-626e.up.railway.app/index.html', r => {
  let d = '';
  r.on('data', c => d += c);
  r.on('end', () => {
    const scripts = d.match(/<script>([\s\S]*?)<\/script>/g);
    const m = scripts[1].match(/<script>([\s\S]*?)<\/script>/);
    const code = m[1];
    
    // Check what's right after position 465
    console.log('Around pos 465:');
    for (let i = 460; i < 480; i++) {
      console.log('[' + i + ']', code.charCodeAt(i), JSON.stringify(code[i]));
    }
    
    // Look for the specific function
    const escJsIdx = code.indexOf('escJs');
    console.log('\nescJs at:', escJsIdx);
    if (escJsIdx > -1) {
      const snippet = code.substring(escJsIdx, escJsIdx + 200);
      console.log('escJs snippet:', snippet);
    }
    
    // Try to find functions
    const lines = code.split('\n');
    let charCount = 0;
    for (let i = 0; i < lines.length; i++) {
      const lineLen = lines[i].length + 1;
      if (charCount <= 470 && charCount + lineLen > 470) {
        console.log('\nLine', i + 1, 'offset', charCount, 'contains pos 470');
        console.log('Line', i + 1, ':', JSON.stringify(lines[i]));
        console.log('Next line:', JSON.stringify(lines[i + 1]));
        console.log('Line', i + 2, ':', JSON.stringify(lines[i + 2]));
        break;
      }
      charCount += lineLen;
    }
    process.exit(0);
  });
}).on('error', e => { console.log('Error:', e.message); process.exit(1); });