const fs = require('fs');
const indexPath = 'C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html';
let html = fs.readFileSync(indexPath, 'utf8');

// The renderHome function - find the search box closing and insert advanced search
const target = 'searchExperts()">搜索</button></div></div>"';
const idx = html.indexOf(target);
if (idx < 0) { console.log('search box not found'); process.exit(1); }

// Insert advanced search toggle and panel after </div></div>" of hero
const insertAt = idx + target.length;
const advHtml = '+\'<a class="search-toggle" onclick="toggleAdvSearch()">高级筛选 ▾</a><div class="search-panel" id="advSearchPanel"><div class="filter-row"><div class="filter-group"><label>最低价格</label><input type="number" id="filterMinPrice" placeholder="不限" min="0"></div><div class="filter-group"><label>最高价格</label><input type="number" id="filterMaxPrice" placeholder="不限" min="0"></div><div class="filter-group"><label>最低评分</label><select id="filterMinRating"><option value="">不限</option><option value="4">4.0以上</option><option value="4.5">4.5以上</option><option value="4.8">4.8以上</option></select></div><div class="filter-group"><button class="btn btn-primary btn-sm" onclick="applyAdvSearch()">应用筛选</button></div></div></div>\'';
html = html.substring(0, insertAt) + advHtml + html.substring(insertAt);
console.log('Advanced search inserted');

// Add coupon banner and FAQ before expertSection close
// Find: (urlIndustry?"":iconRow)+"<div class=\"expert-grid\" id=\"expertList\"></div></div>";
const gridClose = '(urlIndustry?"":iconRow)+"<div class=\\"expert-grid\\" id=\\"expertList\\"></div></div>"';
const gridIdx = html.indexOf(gridClose);
if (gridIdx < 0) { console.log('grid close not found'); process.exit(1); }

const afterGrid = '+(urlIndustry?"":\'<div class="coupon-banner" id="couponBanner"><div><h3>🎉 新用户专享优惠</h3><p>首次咨询立减20元，限量500张</p></div><button class="btn" onclick="claimCoupon()">立即领取</button></div><div class="coupon-list" id="couponList"></div>\')+\'<div class="faq-section"><div class="faq-title">常见问题</div><div class="faq-item" onclick="this.classList.toggle(\\\'open\\\')"><div class="faq-question">如何选择适合的专家？<span class="faq-arrow">▼</span></div><div class="faq-answer">您可以通过行业分类、关键词搜索、评分排序等方式找到合适的专家。建议优先选择已实名认证、评分较高的专家。</div></div><div class="faq-item" onclick="this.classList.toggle(\\\'open\\\')"><div class="faq-question">咨询费用如何支付？<span class="faq-arrow">▼</span></div><div class="faq-answer">提交预约订单后，系统会生成支付订单。费用由平台托管，咨询完成确认后再结算给专家，确保资金安全。</div></div><div class="faq-item" onclick="this.classList.toggle(\\\'open\\\')"><div class="faq-question">对咨询不满意怎么办？<span class="faq-arrow">▼</span></div><div class="faq-answer">咨询完成后可申请退款，平台48小时内审核。合理诉求将全额退款。</div></div><div class="faq-item" onclick="this.classList.toggle(\\\'open\\\')"><div class="faq-question">专家是否实名认证？<span class="faq-arrow">▼</span></div><div class="faq-answer">是的，所有入驻专家均经过实名认证和资质审核，认证专家有专属标识。</div></div><div class="faq-item" onclick="this.classList.toggle(\\\'open\\\')"><div class="faq-question">如何成为平台专家？<span class="faq-arrow">▼</span></div><div class="faq-answer">注册后填写专家资料并提交实名认证，1-3个工作日审核通过即可上线。</div></div></div>\'+"';
const insertAfterGrid = gridIdx + gridClose.length;
html = html.substring(0, insertAfterGrid) + afterGrid + html.substring(insertAfterGrid);
console.log('Coupon + FAQ inserted');

// Add new functions before closing </script>
const newFuncs = `
function toggleAdvSearch(){var p=document.getElementById("advSearchPanel");if(p)p.classList.toggle("open");}
function applyAdvSearch(){loadExperts(1);}
async function claimCoupon(){if(!currentUser){showLogin();return;}var r=await api("/coupons/claim",{method:"POST"});if(r.success){alert("优惠券已领取！首单立减20元");var b=document.getElementById("couponBanner");if(b)b.style.display="none";loadMyCoupons();}else{alert(r.error||"领取失败");}}
async function loadMyCoupons(){if(!currentUser)return;try{var r=await api("/coupons/mine");var el=document.getElementById("couponList");if(!el||!r.list||!r.list.length){if(el)el.style.display="none";return;}el.style.display="flex";var h="";for(var i=0;i<r.list.length;i++){var c=r.list[i];var used=c.status==="used"||c.status==="expired";h+='<div class="coupon-item"><div class="coupon-amount">¥20<span></span></div><div class="coupon-condition">'+(c.min_amount>0?"满¥"+c.min_amount+"可用":"无门槛")+'</div><button class="coupon-btn'+(used?" used":"")+'" '+(used?"disabled":"")+'>'+(c.status==="used"?"已使用":c.status==="expired"?"已过期":"待使用")+'</button></div>';}el.innerHTML=h;}catch(e){}}
function loadHotSearches(){var tags=["人工智能","数据分析","商业咨询","法律顾问","心理咨询","投资理财"];var el=document.getElementById("hotSearches");if(!el)return;var h="";for(var i=0;i<tags.length;i++)h+='<span class="hot-tag" onclick="document.getElementById(\\'searchInput\\').value=\\''+tags[i]+'\\';searchExperts()">'+tags[i]+'</span>';el.innerHTML=h;}
`;

const closeScriptIdx = html.lastIndexOf('</script>');
if (closeScriptIdx > 0) {
  html = html.substring(0, closeScriptIdx) + newFuncs + '\n</script>';
  console.log('New functions added');
}

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Done');
