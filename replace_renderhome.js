const fs = require('fs');
const p = String.raw`C:\Users\dailu\Desktop\expert-platform\public\index.html`;
let html = fs.readFileSync(p, 'utf8');

// Find renderHome function boundaries
const start = html.indexOf('function renderHome(){');
if (start < 0) { console.log('renderHome not found'); process.exit(1); }

// Find the end: next function after renderHome is loadExperts or filterByIndustry
const nextFunc = html.indexOf('function filterByIndustry(');
if (nextFunc < 0) { console.log('filterByIndustry not found'); process.exit(1); }

const end = nextFunc;
console.log('renderHome:', start, 'to', end, 'len:', end - start);

// Extract the old renderHome
const oldRH = html.substring(start, end);
console.log('Old renderHome length:', oldRH.length);

// Now write the new renderHome - clean version with all features
const newRH = `function renderHome(){const industries=["人工智能","数据科学","软件开发","产品设计","市场营销","金融投资","法律咨询","医疗健康","教育培训","其他"];const icons=["🤖","📊","💻","🎨","📢","💰","⚖️","🏥","🎓","📌"];let io="<option value=\\">全部行业</option>";for(const ind of industries)io+="<option>"+ind+"</option>";let iconRow="<div class=\\"industry-icons\\">";for(let i=0;i<industries.length;i++)iconRow+="<div class=\\"industry-icon-item\\" onclick=\\"filterByIndustry('"+industries[i]+"')\\"><div class=\\"icon\\">"+icons[i]+"</div><div class=\\"label\\">"+industries[i]+"</div></div>";iconRow+="</div>";let backBtn=urlIndustry?"<div style=\\"margin-bottom:16px\\"><button class=\\"btn btn-outline\\" onclick=\\"window.location.href='/'\\">← 返回首页</button></div>":"";let h="<div class=\\"hero\\"><h1>"+(urlIndustry?urlIndustry+" 专家":"找到最适合您的专家")+"</h1>"+(urlIndustry?"<p>浏览"+urlIndustry+"领域的专业专家</p>":"<p>24年行业深耕 · 10000+成功案例 · 98%客户满意度</p>")+"<div class=\\"search-box\\"><input type=\\"text\\" id=\\"searchInput\\" placeholder=\\"搜索专家姓名/擅长领域...\\" onkeydown=\\"if(event.key==='Enter')searchExperts()\\"><select id=\\"industryFilter\\">"+io+"</select><button class=\\"btn btn-primary\\" onclick=\\"searchExperts()\\">搜索</button></div><div class=\\"hot-searches\\" id=\\"hotSearches\\"></div><a class=\\"search-toggle\\" onclick=\\"toggleAdvSearch()\\">高级筛选 ▾</a><div class=\\"search-panel\\" id=\\"advSearchPanel\\"><div class=\\"filter-row\\"><div class=\\"filter-group\\"><label>最低价格</label><input type=\\"number\\" id=\\"filterMinPrice\\" placeholder=\\"不限\\" min=\\"0\\"></div><div class=\\"filter-group\\"><label>最高价格</label><input type=\\"number\\" id=\\"filterMaxPrice\\" placeholder=\\"不限\\" min=\\"0\\"></div><div class=\\"filter-group\\"><label>最低评分</label><select id=\\"filterMinRating\\"><option value=\\">不限</option><option value=\\"4\\">4.0以上</option><option value=\\"4.5\\">4.5以上</option><option value=\\"4.8\\">4.8以上</option></select></div><div class=\\"filter-group\\"><button class=\\"btn btn-primary btn-sm\\" onclick=\\"applyAdvSearch()\\">应用筛选</button></div></div></div></div>"+backBtn+"<div class=\\"stats-bar\\"><div class=\\"stat-item\\"><div class=\\"stat-num\\">128</div><div class=\\"stat-label\\">入驻专家</div></div><div class=\\"stat-item\\"><div class=\\"stat-num\\">3650+</div><div class=\\"stat-label\\">完成咨询</div></div><div class=\\"stat-item\\"><div class=\\"stat-num\\">98%</div><div class=\\"stat-label\\">满意率</div></div><div class=\\"stat-item\\"><div class=\\"stat-num\\">15分钟</div><div class=\\"stat-label\\">快速响应</div></div></div>"+(urlIndustry?"":'<div class="features"><div class="feature"><div class="feature-icon">✓</div><div class="feat-title">实名认证</div><div class="feat-desc">专家100%实名认证，资质审核</div></div><div class="feature"><div class="feature-icon">✓</div><div class="feat-title">透明评价</div><div class="feat-desc">真实用户评价，看得见的口碑</div></div><div class="feature"><div class="feature-icon">✓</div><div class="feat-title">支付保障</div><div class="feat-desc">平台托管，满意后再确认</div></div><div class="feature"><div class="feature-icon">✓</div><div class="feat-title">售后无忧</div><div class="feat-desc">不满意可退款，权益有保障</div></div></div>')+"<div id=\\"expertSection\\"><div class=\\"section-title\\" id=\\"expertSectionTitle\\">"+(urlIndustry?urlIndustry+" 专家":"推荐专家")+"</div>"+(urlIndustry?"":iconRow)+"<div class=\\"expert-grid\\" id=\\"expertList\\"></div><div id=\\"homeExtras\\"></div></div>";document.getElementById("app").innerHTML=h;if(!urlIndustry)loadHomeExtras();}`;

html = html.substring(0, start) + newRH + html.substring(end);
console.log('renderHome replaced, new length:', newRH.length);

fs.writeFileSync(p, html, 'utf8');
console.log('Saved');
