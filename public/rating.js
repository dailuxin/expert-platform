// public/rating.js — 专家评分 + 排名前端

// ========== 专家排名页面 ==========
function renderRanking() {
  const sort = (new URLSearchParams(location.search)).get('sort') || 'rating';
  fetchJSON(API + '/ranking?sort=' + sort + '&limit=50').then(data => {
    if (!data.success) { document.getElementById('app').innerHTML = '<div class="empty">加载失败</div>'; return; }
    let h = '<div class="section-title">专家排名';
    h += ' <a href="#" onclick="renderHome();return false;" style="float:right;font-size:14px">← 返回首页</a>';
    h += '</div>';

    // 排序切换
    h += '<div style="margin:16px 0">排序：';
    ['rating','reviews','income','consultations'].forEach(s => {
      const label = {rating:'评分',reviews:'评价数',income:'收益',consultations:'咨询量'}[s];
      h += ' <a href="#" class="' + (sort===s?'btn':'btn-outline') + '" onclick="location.search=\'sort=' + s + '\';return false">' + label + '</a>';
    });
    h += '</div>';

    if (!data.list || !data.list.length) {
      h += '<div class="empty"><div class="icon">🏆</div>暂无排名数据</div>';
    } else {
      h += '<div class="cards">';
      data.list.forEach((e, i) => {
        const stars = renderStars(e.avg_rating || 0);
        h += '<div class="card" onclick="renderExpertDetail(' + e.id + ')" style="cursor:pointer">';
        h += '<div style="display:flex;justify-content:space-between;align-items:center">';
        h += '<div style="font-size:20px;font-weight:700;color:#e53e3e">#' + (i+1) + '</div>';
        h += '<div>' + stars + ' <span style="color:#718096">(' + (e.review_count||0) + '条评价)</span></div>';
        h += '</div>';
        h += '<div style="font-weight:600;font-size:16px;margin:8px 0">' + escHtml(e.real_name) + '</div>';
        h += '<div style="font-size:13px;color:#718096">' + escHtml(e.industry||'') + ' / ' + escHtml(e.title||'') + '</div>';
        if (e.total_income) h += '<div style="margin-top:8px;color:#38a169;font-size:14px">收益：¥' + (e.total_income/100).toFixed(2) + '</div>';
        h += '</div>';
      });
      h += '</div>';
    }
    document.getElementById('app').innerHTML = h;
  });
}

function renderStars(rating) {
  let s = '';
  for (let i=1; i<=5; i++) s += i <= rating ? '★' : '☆';
  return s;
}

// ========== 专家详情页：注入评分和评价 ==========
// 在 renderExpertDetail 末尾调用
function injectReviews(expertId) {
  fetchJSON(API + '/experts/' + expertId + '/reviews').then(data => {
    if (!data) return;
    let h = '<div style="margin-top:32px"><div class="section-title">用户评价（' + (data.review_count||0) + '条）</div>';

    // 提交评价表单（已登录用户）
    if (typeof currentUser !== 'undefined' && currentUser) {
      h += '<div class="card"><div style="font-weight:600;margin-bottom:8px">提交评价</div>';
      h += '<div id="starInput">';
      for (let i=1;i<=5;i++) h += '<span style="font-size:24px;cursor:pointer;color:#ecc94b" onclick="selectRating(' + i + ')">☆</span>';
      h += '</div>';
      h += '<textarea id="reviewContent" rows="3" placeholder="说说你的咨询体验..." style="width:100%;margin:8px 0;padding:8px;border:1px solid #e2e8f0;border-radius:6px"></textarea>';
      h += '<button class="btn" onclick="submitReview(' + expertId + ')">提交评价</button>';
      h += '</div>';
    }

    if (data.reviews && data.reviews.length) {
      data.reviews.forEach(r => {
        const stars = renderStars(r.rating);
        h += '<div class="card" style="margin-bottom:12px">';
        h += '<div>' + stars + ' <span style="font-size:13px;color:#718096">' + escHtml(r.user_name) + ' · ' + r.created_at + '</span></div>';
        h += '<div style="margin-top:6px">' + escHtml(r.content) + '</div>';
        if (r.reply) h += '<div style="background:#f7fafc;padding:8px;margin-top:8px;border-radius:6px;font-size:13px"><b>专家回复：</b>' + escHtml(r.reply) + '</div>';
        h += '</div>';
      });
    } else {
      h += '<div style="color:#a0aec0;font-size:14px;margin-top:12px">暂无评价</div>';
    }
    h += '</div>';

    // 注入到专家详情页末尾
    const app = document.getElementById('app');
    app.insertAdjacentHTML('beforeend', h);
  });
}

let selectedRating = 0;
function selectRating(n) {
  selectedRating = n;
  const stars = document.querySelectorAll('#starInput span');
  stars.forEach((s, i) => s.textContent = i < n ? '★' : '☆');
}

function submitReview(expertId) {
  const content = document.getElementById('reviewContent').value;
  if (!selectedRating) { alert('请选择评分'); return; }
  fetch(API + '/experts/' + expertId + '/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating: selectedRating, content })
  }).then(r => r.json()).then(d => {
    if (d.success) { alert('评价成功！'); renderExpertDetail(expertId); }
    else alert(d.message || '提交失败');
  });
}

// ========== 专家回复评价 ==========
function replyReview(reviewId) {
  const reply = prompt('输入回复内容：');
  if (!reply) return;
  fetch(API + '/reviews/' + reviewId + '/reply', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reply })
  }).then(r => r.json()).then(d => {
    if (d.success) { alert('回复成功'); location.reload(); }
    else alert(d.message || '回复失败');
  });
}
