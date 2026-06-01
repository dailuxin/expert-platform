// ===== 支付流程改造 + 首页改版补丁 =====

// --- 支付：增加支付方式选择 + 模拟支付确认 ---
// POST /api/bookings/:id/prepare-payment — 创建支付订单（不直接扣款）
// POST /api/bookings/:id/confirm-payment — 确认支付（模拟扣款）

// --- 首页改版数据接口 ---

const express = require('express');
const router = express.Router();

// === 支付流程改造 ===

// 1. 准备支付（返回支付信息，不扣款）
router.post('/bookings/:id/prepare-payment', (req, res) => {
  const db = req.app.get('db');
  const session = req.session;
  if (!session || !session.userId) return res.status(401).json({ error: '未登录' });

  const booking = db.get('SELECT b.*, e.name as expert_name FROM bookings b LEFT JOIN users e ON b.expert_id = e.id WHERE b.id = ? AND b.user_id = ?', [req.params.id, session.userId]);
  if (!booking) return res.status(404).json({ error: '订单不存在' });
  if (booking.status !== 'pending_payment') return res.status(400).json({ error: '订单状态不正确' });

  // 生成支付订单号
  const payNo = 'EP' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase();
  
  res.json({
    success: true,
    pay_no: payNo,
    amount: booking.amount,
    expert_name: booking.expert_name,
    booking_date: booking.booking_date,
    time_slot: booking.time_slot,
    topic: booking.topic,
    expires_in: 1800 // 30分钟有效期
  });
});

// 2. 确认支付（模拟扣款）
router.post('/bookings/:id/confirm-payment', (req, res) => {
  const db = req.app.get('db');
  const session = req.session;
  if (!session || !session.userId) return res.status(401).json({ error: '未登录' });

  const { method, pay_no } = req.body || {};
  const booking = db.get('SELECT * FROM bookings WHERE id = ? AND user_id = ?', [req.params.id, session.userId]);
  if (!booking) return res.status(404).json({ error: '订单不存在' });
  if (booking.status !== 'pending_payment') return res.status(400).json({ error: '订单已支付或已过期' });

  // 模拟处理时间
  setTimeout(() => {
    const amount = booking.amount || 0;
    const commissionRate = parseFloat(db.get('SELECT value FROM platform_config WHERE key = ?', ['commission_rate'])?.value || '0.15');
    const platformFee = Math.round(amount * commissionRate);
    const expertIncome = amount - platformFee;
    const payMethod = method || 'wechat';

    db.run(`INSERT INTO payments (booking_id, user_id, amount, method, status, paid_at) VALUES (?, ?, ?, ?, 'success', datetime('now'))`,
      [booking.id, session.userId, amount, payMethod]);
    db.run(`UPDATE bookings SET status = 'paid', paid_at = datetime('now'), payment_method = ?, platform_fee = ?, expert_income = ? WHERE id = ?`,
      [payMethod, platformFee, expertIncome, booking.id]);

    // 入驻专家钱包
    const expert = db.get('SELECT id, user_id FROM experts WHERE id = ?', [booking.expert_id]);
    if (expert) {
      let wallet = db.get('SELECT * FROM expert_wallet WHERE expert_id = ?', [expert.id]);
      if (!wallet) db.run('INSERT INTO expert_wallet (expert_id, balance, total_income) VALUES (?, 0, 0)', [expert.id]);
      db.run('UPDATE expert_wallet SET balance = balance + ?, total_income = total_income + ?, updated_at = datetime("now") WHERE expert_id = ?', [expertIncome, expertIncome, expert.id]);
      db.run('INSERT INTO notifications (user_id, type, title, content, related_id) VALUES (?, ?, ?, ?, ?)',
        [expert.user_id, 'booking', '新预约待确认', `用户支付 ¥${amount}，您的收入 ¥${expertIncome}`, booking.id]);
    }

    db.run('INSERT INTO notifications (user_id, type, title, content, related_id) VALUES (?, ?, ?, ?, ?)',
      [session.userId, 'booking_update', '支付成功', `已支付 ¥${amount}，手续费 ¥${platformFee}`, booking.id]);
    db.save();
  }, 1500); // 模拟1.5秒支付处理

  res.json({ success: true, message: '支付处理中...', pay_no });
});

// === 首页统计数据 ===
router.get('/home/stats', (req, res) => {
  const db = req.app.get('db');
  const expertCount = db.get("SELECT COUNT(*) as c FROM users WHERE role='expert' AND status='approved'")?.c || 0;
  const userCount = db.get("SELECT COUNT(*) as c FROM users WHERE role='user'")?.c || 0;
  const orderCount = db.get("SELECT COUNT(*) as c FROM bookings WHERE status='completed'")?.c || 0;
  const articleCount = db.get("SELECT COUNT(*) as c FROM articles")?.c || 0;
  const reviewCount = db.get("SELECT COUNT(*) as c FROM reviews")?.c || 0;
  res.json({ expertCount, userCount, orderCount, articleCount, reviewCount });
});

// === 首页推荐专家（按评分+订单量排序）===
router.get('/home/featured', (req, res) => {
  const db = req.app.get('db');
  const experts = db.query(`
    SELECT u.id, u.name, u.title, u.industry, u.avatar, u.specialties,
           COALESCE(e.avg_rating, 0) as avg_rating, COALESCE(e.review_count, 0) as review_count,
           COALESCE(e.completed_count, 0) as completed_count
    FROM users u LEFT JOIN experts e ON u.id = e.user_id
    WHERE u.role = 'expert' AND u.status = 'approved'
    ORDER BY e.avg_rating DESC, e.completed_count DESC
    LIMIT 6
  `);
  res.json(experts);
});

// === 最新文章 ===
router.get('/home/articles', (req, res) => {
  const db = req.app.get('db');
  const articles = db.query(`
    SELECT a.*, u.name as author_name, u.avatar as author_avatar
    FROM articles a LEFT JOIN users u ON a.author_id = u.id
    ORDER BY a.created_at DESC LIMIT 4
  `);
  res.json(articles);
});

module.exports = router;
