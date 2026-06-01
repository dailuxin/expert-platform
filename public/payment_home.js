// ===== 支付弹窗 + 首页改版 =====

// ========== 模拟支付弹窗 ==========
function showPaymentModal(bookingId) {
  // 先获取支付信息
  fetch(API + '/bookings/' + bookingId + '/prepare-payment', { headers: authHeaders() })
    .then(r => r.json())
    .then(data => {
      if (!data.success) return alert(data.error || '获取支付信息失败');
      openPaymentModal(data, bookingId);
    })
    .catch(() => alert('网络错误'));
}

function openPaymentModal(info, bookingId) {
  const modal = document.getElementById('modal');
  const content = document.getElementById('modalContent');
  
  content.innerHTML = `
    <div class="payment-modal">
      <h2>💳 确认支付</h2>
      <div class="pay-info">
        <div class="pay-row"><span>专家</span><span>${escHtml(info.expert_name)}</span></div>
        <div class="pay-row"><span>时间</span><span>${escHtml(info.booking_date)} ${escHtml(info.time_slot)}</span></div>
        <div class="pay-row"><span>主题</span><span>${escHtml(info.topic || '咨询')}</span></div>
        <div class="pay-row pay-amount"><span>支付金额</span><span>¥${info.amount}</span></div>
      </div>
      <div class="pay-methods">
        <label class="pay-method active" onclick="selectPayMethod(this, 'wechat')">
          <span class="method-icon wechat">微信</span>
          <span class="method-name">微信支付</span>
          <span class="method-check">✓</span>
        </label>
        <label class="pay-method" onclick="selectPayMethod(this, 'alipay')">
          <span class="method-icon alipay">支付宝</span>
          <span class="method-name">支付宝</span>
          <span class="method-check"></span>
        </label>
      </div>
      <div class="pay-timer" id="payTimer">支付剩余时间：<span id="payCountdown">29:59</span></div>
      <button class="pay-btn" id="payBtn" onclick="confirmPayment(${bookingId}, '${info.pay_no}')">确认支付 ¥${info.amount}</button>
      <div class="pay-note">⚠️ 当前为模拟支付环境，不会产生真实扣款</div>
    </div>
  `;

  // 存储支付信息
  window._currentPay = { method: 'wechat', bookingId, pay_no: info.pay_no };
  
  // 倒计时
  let seconds = info.expires_in || 1800;
  window._payTimer = setInterval(() => {
    seconds--;
    const m = Math.floor(seconds / 60), s = seconds % 60;
    const el = document.getElementById('payCountdown');
    if (el) el.textContent = m + ':' + (s < 10 ? '0' : '') + s;
    if (seconds <= 0) { clearInterval(window._payTimer); closeModal(); alert('支付超时'); }
  }, 1000);

  modal.style.display = 'flex';
}

function selectPayMethod(el, method) {
  document.querySelectorAll('.pay-method').forEach(m => { m.classList.remove('active'); m.querySelector('.method-check').textContent = ''; });
  el.classList.add('active');
  el.querySelector('.method-check').textContent = '✓';
  window._currentPay.method = method;
}

function confirmPayment(bookingId, payNo) {
  const btn = document.getElementById('payBtn');
  btn.disabled = true;
  btn.textContent = '支付处理中...';
  
  fetch(API + '/bookings/' + bookingId + '/confirm-payment', {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ method: window._currentPay.method, pay_no: payNo })
  })
    .then(r => r.json())
    .then(data => {
      clearInterval(window._payTimer);
      closeModal();
      if (data.success) {
        showPaySuccess(bookingId);
      } else {
        alert(data.error || '支付失败');
        btn.disabled = false;
        btn.textContent = '确认支付';
      }
    })
    .catch(() => {
      btn.disabled = false;
      btn.textContent = '确认支付';
      alert('网络错误');
    });
}

function showPaySuccess(bookingId) {
  const modal = document.getElementById('modal');
  const content = document.getElementById('modalContent');
  content.innerHTML = `
    <div class="pay-success" style="text-align:center;padding:40px 20px;">
      <div style="font-size:64px;margin-bottom:16px;">✅</div>
      <h2 style="color:#27ae60;">支付成功</h2>
      <p style="color:#666;margin:16px 0;">专家将在24小时内确认预约，请留意通知。</p>
      <button class="btn-primary" onclick="closeModal();navigate('bookings')" style="background:#667eea;color:#fff;border:none;padding:10px 24px;border-radius:8px;cursor:pointer;">查看我的预约</button>
    </div>
  `;
  modal.style.display = 'flex';
  // 刷新通知
  if (typeof loadNotifications === 'function') loadNotifications();
}

// ========== 首页改版 ==========
function renderHomeV2() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="home-v2">
      <!-- Hero区 -->
      <section class="hero-v2">
        <div class="hero-content">
          <h1>找到你的专属专家</h1>
          <p class="hero-sub">连接 ${1000+Math.floor(Math.random()*500)}+ 认证专家，获取专业咨询服务</p>
          <div class="hero-search">
            <input id="searchInput" placeholder="搜索专家、领域、问题..." onkeydown="if(event.key==='Enter'){urlIndustry=null;loadExpertsPaged(1);}">
            <button class="hero-search-btn" onclick="urlIndustry=null;loadExpertsPaged(1)">搜索</button>
          </div>
          <div class="hero-tags" id="heroTags">
            <span class="hero-tag" onclick="document.getElementById('searchInput').value='心理咨询';loadExpertsPaged(1)">心理咨询</span>
            <span class="hero-tag" onclick="document.getElementById('searchInput').value='法律咨询';loadExpertsPaged(1)">法律咨询</span>
            <span class="hero-tag" onclick="document.getElementById('searchInput').value='职场规划';loadExpertsPaged(1)">职场规划</span>
            <span class="hero-tag" onclick="document.getElementById('searchInput').value='财税顾问';loadExpertsPaged(1)">财税顾问</span>
          </div>
        </div>
      </section>

      <!-- 数据统计条 -->
      <section class="stats-bar" id="statsBar">
        <div class="stat-item"><span class="stat-num" id="statExperts">--</span><span class="stat-label">认证专家</span></div>
        <div class="stat-item"><span class="stat-num" id="statUsers">--</span><span class="stat-label">注册用户</span></div>
        <div class="stat-item"><span class="stat-num" id="statOrders">--</span><span class="stat-label">完成咨询</span></div>
        <div class="stat-item"><span class="stat-num" id="statReviews">--</span><span class="stat-label">好评反馈</span></div>
      </section>

      <!-- 行业分类入口 -->
      <section class="industry-section">
        <h2 class="section-title">热门行业</h2>
        <div class="industry-grid">
          <div class="industry-card" onclick="urlIndustry='心理咨询';loadExpertsPaged(1)"><span class="ic">🧠</span><span>心理咨询</span></div>
          <div class="industry-card" onclick="urlIndustry='法律咨询';loadExpertsPaged(1)"><span class="ic">⚖️</span><span>法律咨询</span></div>
          <div class="industry-card" onclick="urlIndustry='职业规划';loadExpertsPaged(1)"><span class="ic">💼</span><span>职业规划</span></div>
          <div class="industry-card" onclick="urlIndustry='财税顾问';loadExpertsPaged(1)"><span class="ic">📊</span><span>财税顾问</span></div>
          <div class="industry-card" onclick="urlIndustry='教育辅导';loadExpertsPaged(1)"><span class="ic">📚</span><span>教育辅导</span></div>
          <div class="industry-card" onclick="urlIndustry='医疗健康';loadExpertsPaged(1)"><span class="ic">🏥</span><span>医疗健康</span></div>
          <div class="industry-card" onclick="urlIndustry='IT技术';loadExpertsPaged(1)"><span class="ic">💻</span><span>IT技术</span></div>
          <div class="industry-card" onclick="urlIndustry='设计创意';loadExpertsPaged(1)"><span class="ic">🎨</span><span>设计创意</span></div>
        </div>
      </section>

      <!-- 推荐专家 -->
      <section class="featured-section">
        <h2 class="section-title">推荐专家</h2>
        <div class="featured-grid" id="featuredGrid">
          <div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div>
        </div>
        <div style="text-align:center;margin-top:16px;">
          <button class="btn-outline" onclick="urlIndustry=null;loadExpertsPaged(1)">查看全部专家 →</button>
        </div>
      </section>

      <!-- 最新文章 -->
      <section class="articles-section" id="articlesSection" style="display:none">
        <h2 class="section-title">专家文章</h2>
        <div class="articles-grid" id="articlesGrid"></div>
      </section>

      <!-- 优惠券横幅 -->
      <section class="coupon-banner" id="couponBanner" style="display:none">
        <div class="coupon-content">
          <span class="coupon-badge">🎉 新人优惠</span>
          <span>注册即领 <b>¥20</b> 咨询优惠券</span>
          <button class="coupon-btn" onclick="navigate('register')">立即领取</button>
        </div>
      </section>

      <!-- FAQ -->
      <section class="faq-section">
        <h2 class="section-title">常见问题</h2>
        <div class="faq-list">
          <details class="faq-item"><summary>如何选择合适的专家？</summary><p>通过行业分类筛选，查看专家资质、评分和用户评价，选择最匹配的专家。</p></details>
          <details class="faq-item"><summary>咨询费用如何计算？</summary><p>每位专家自行定价，可在专家详情页查看具体收费。新用户可领取优惠券抵扣。</p></details>
          <details class="faq-item"><summary>如何申请退款？</summary><p>在"我的预约"中找到未开始的订单，点击退款即可。48小时内审核通过后退款。</p></details>
          <details class="faq-item"><summary>专家资质如何认证？</summary><p>所有专家均经过实名认证和资质审核，认证专家有专属标识。</p></details>
        </div>
      </section>
    </div>
  `;

  // 加载统计数据
  fetch(API + '/home/stats').then(r => r.json()).then(s => {
    const el = (id) => document.getElementById(id);
    if (el('statExperts')) el('statExperts').textContent = s.expertCount;
    if (el('statUsers')) el('statUsers').textContent = s.userCount;
    if (el('statOrders')) el('statOrders').textContent = s.orderCount;
    if (el('statReviews')) el('statReviews').textContent = s.reviewCount;
  }).catch(() => {});

  // 加载推荐专家
  fetch(API + '/home/featured').then(r => r.json()).then(list => {
    const grid = document.getElementById('featuredGrid');
    if (!grid || !list.length) return;
    grid.innerHTML = list.map(e => `
      <div class="featured-card" onclick="navigate('expert/' + ${e.id})">
        <div class="fc-avatar" style="background:${e.avatar || '#667eea'}">${(e.name || '?')[0]}</div>
        <div class="fc-info">
          <div class="fc-name">${escHtml(e.name || '')}</div>
          <div class="fc-title">${escHtml(e.title || '')}</div>
          <div class="fc-stats">⭐ ${e.avg_rating || 0} · ${e.review_count || 0}条评价 · ${e.completed_count || 0}次咨询</div>
        </div>
      </div>
    `).join('');
  }).catch(() => {});

  // 加载最新文章
  fetch(API + '/home/articles').then(r => r.json()).then(list => {
    if (!list.length) return;
    document.getElementById('articlesSection').style.display = 'block';
    document.getElementById('articlesGrid').innerHTML = list.map(a => `
      <div class="article-card" onclick="navigate('article/' + ${a.id})">
        <div class="ac-title">${escHtml(a.title || '')}</div>
        <div class="ac-meta">${escHtml(a.author_name || '')} · ${a.created_at ? a.created_at.split('T')[0] : ''}</div>
      </div>
    `).join('');
  }).catch(() => {});

  // 优惠券横幅（未登录时显示）
  if (!currentUser) document.getElementById('couponBanner').style.display = 'block';
}
