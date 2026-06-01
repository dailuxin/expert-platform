const fs = require('fs');
const p = 'C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html';
let html = fs.readFileSync(p, 'utf8');

const start = html.indexOf('function renderHome(){');
const end = html.indexOf('function filterByIndustry(');

// Use template literal to avoid escaping hell
const newRH = `function renderHome(){const industries=["人工智能","数据科学","软件开发","产品设计","市场营销","金融投资","法律咨询","医疗健康","教育培训","其他"];const icons=["🤖","📊","💻","🎨","📢","💰","⚖️","🏥","🎓","📌"];let io="<option value=\\">全部行业</option>";for(const ind of industries)io+="<option>"+ind+"</option>";let iconRow="<div class=\\"industry-icons\\">";for(let i=0;i<industries.length;i++)iconRow+="<div class=\\"industry-icon-item\\" onclick=\\"filterByIndustry('"+industries[i]+"')\\"><div class=\\"icon\\">"+icons[i]+"</div><div class=\\"label\\">"+industries[i]+"</div></div>";iconRow+="</div>";let backBtn=urlIndustry?"<div style=\\"margin-bottom:16px\\"><button class=\\"btn btn-outline\\" onclick=\\"window.location.href='/'\\">← 返回首页</button></div>":"";let h="<div class=\\"hero\\"><h1>"+(urlIndustry?urlIndustry+" 专家":"找到最适合您的专家")+"</h1>"+(urlIndustry?"<p>浏览"+urlIndustry+"领域的专业专家</p>":"<p>24年深耕 · 10000+成功案例 · 98%客户满意度</p>")+"<div class=\\"search-box\\"><input type=\\"text\\" id=\\"searchInput\\" placeholder=\\"搜索专家姓名/擅长领域...\\" onkeydown=\\"if(event.key==='Enter')searchExperts()\\"><select id=\\"industryFilter\\">"+io+"</select><button class=\\"btn btn-primary\\" onclick=\\"searchExperts()\\">搜索</button></div><div class=\\"hot-searches\\" id=\\"hotSearches\\"></div><a class=\\"search-toggle\\" onclick=\\"toggleAdvSearch()\\">高级筛选 ▾</a><div class=\\"search-panel\\" id=\\"advSearchPanel\\"><div class=\\"filter-row\\"><div class=\\"filter-group\\"><label>最低价格</label><input type=\\"number\\" id=\\"filterMinPrice\\" placeholder=\\"不限\\" min=\\"0\\"></div><div class=\\"filter-group\\"><label>最高价格</label><input type=\\"number\\" id=\\"filterMaxPrice\\" placeholder=\\"不限\\" min=\\"0\\"></div><div class=\\"filter-group\\"><label>最低评分</label><select id=\\"filterMinRating\\"><option value=\\">不限</option><option value=\\"4\\">4.0以上</option><option value=\\"4.5\\">4.5以上</option><option value=\\"4.8\\">4.8以上</option></select></div><div class=\\"filter-group\\"><button class=\\"btn btn-primary btn-sm\\" onclick=\\"applyAdvSearch()\\">应用筛选</button></div></div></div></div>"+backBtn+"<div class=\\"stats-bar\\"><div class=\\"stat-item\\"><div class=\\"stat-num\\">128</div><div class=\\"stat-label\\">入驻专家</div></div><div class=\\"stat-item\\"><div class=\\"stat-num\\">3650+</div><div class=\\"stat-label\\">完成咨询</div></div><div class=\\"stat-item\\"><div class=\\"stat-num\\">98%</div><div class=\\"stat-label\\">满意率</div></div><div class=\\"stat-item\\"><div class=\\"stat-num\\">15分钟</div><div class=\\"stat-label\\">快速响应</div></div></div>"+(urlIndustry?"":iconRow)+"<div id=\\"expertSection\\"><div class=\\"section-title\\" id=\\"expertSectionTitle\\">"+(urlIndustry?urlIndustry+" 专家":"推荐专家")+"</div><div class=\\"expert-grid\\" id=\\"expertList\\"></div><div id=\\"homeExtras\\"></div></div>";document.getElementById("app").innerHTML=h;if(!urlIndustry)loadHomeExtras();}`;

html = html.substring(0, start) + newRH + html.substring(end);

// Validate
const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
let match;
while ((match = scriptRegex.exec(html)) !== null) {
  const code = match[1].trim();
  if (code && code.length > 10000) {
    try {
      new Function(code);
      console.log('Syntax OK');
    } catch (e) {
      console.log('Syntax ERROR:', e.message);
    }
  }
}

fs.writeFileSync(p, html, 'utf8');
console.log('Saved');
