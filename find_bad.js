const fs = require('fs');
let html = fs.readFileSync('C:/Users/dailu/Desktop/expert-platform/public/index.html', 'utf8');

// 修复 renderVerification 中的语法错误
// 错误行：
// el.innerHTML="<div class=\"alert \"+(v.status==='approved'?"alert-success":"alert-warning")+"\">认证状态："+st2[v.status]+(v.remark?"<br>意见："+escHtml(v.remark):"")+"</div>";
// 问题：`"alert \"` 这里引号不匹配

// 正确写法（用单引号包裹整个字符串）：
// el.innerHTML='<div class="alert '+(v.status==='approved'?'alert-success':'alert-warning')+'">认证状态：'+st2[v.status]+(v.remark?'<br>意见：'+escHtml(v.remark):'')+'</div>';

const old = 'el.innerHTML="<div class=\\"alert \\"+(v.status===\'approved\'?"alert-success":"alert-warning")+"\\">认证状态："+st2[v.status]+(v.remark?"<br>意见："+escHtml(v.remark):"")+"</div>"';
const rep = 'el.innerHTML=\'<div class="alert \'+(v.status===\'approved\'?"alert-success":"alert-warning")+\'">认证状态：\'+st2[v.status]+(v.remark?\'<br>意见：\'+escHtml(v.remark):\'\')+\'</div>\'';

console.log('old found:', html.includes(old));

// 如果找不到，尝试搜索简化版本
if (!html.includes(old)) {
  const search = 'el.innerHTML="<div class="alert "';
  const idx = html.indexOf(search);
  if (idx > -1) {
    console.log('Found search at index', idx);
    console.log('Context:', html.substring(idx, idx + 250));
  } else {
    console.log('search not found');
    // 尝试另一种搜索
    const search2 = 'alert \\\"+(v.status';
    const idx2 = html.indexOf(search2);
    if (idx2 > -1) {
      console.log('Found search2 at index', idx2);
      console.log('Context:', html.substring(idx2 - 50, idx2 + 200));
    }
  }
}
