const fs = require('fs');
const p = 'C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html';
const html = fs.readFileSync(p, 'utf8');

const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
let match;
while ((match = scriptRegex.exec(html)) !== null) {
  const code = match[1].trim();
  if (code && code.length > 10000) {
    // Check if file has been saved correctly by trying to eval it
    // Also check if there are any encoding issues
    const buf = fs.readFileSync(p);
    // Show BOM check
    if (buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) {
      console.log('WARNING: UTF-8 BOM detected');
    } else {
      console.log('No BOM');
    }
    
    // Try vm.Script instead
    const vm = require('vm');
    try {
      new vm.Script(code);
      console.log('vm.Script: OK');
    } catch (e) {
      console.log('vm.Script:', e.message);
    }
    
    // Try require approach
    try {
      eval(code);
    } catch (e) {
      console.log('eval:', e.message);
    }
  }
}
