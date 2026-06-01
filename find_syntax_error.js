const fs = require('fs');
const p = String.raw`C:\Users\dailu\Desktop\expert-platform\public\index.html`;
const html = fs.readFileSync(p, 'utf8');

// Extract script 6 (the main one)
const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let idx = 0;
while ((match = scriptRegex.exec(html)) !== null) {
  const code = match[1].trim();
  if (code && code.length > 10000) {
    // Binary search for the error
    const lines = code.split('\n');
    console.log('Total lines:', lines.length);
    
    // Try to find showBooking area
    const sbIdx = code.indexOf('function showBooking(');
    if (sbIdx > 0) {
      console.log('showBooking at char:', sbIdx);
      // Check 200 chars around it
      const ctx = code.substring(sbIdx, sbIdx + 300);
      console.log('showBooking first 300:', ctx);
    }
    
    // Find the unexpected ) near 51589
    // Try eval with smaller chunks
    for (let start = 0; start < code.length; start += 5000) {
      try {
        new Function(code.substring(0, start + 5000));
      } catch (e) {
        console.log('Error in chunk:', start, 'to', start + 5000, e.message);
        break;
      }
    }
  }
  idx++;
}
