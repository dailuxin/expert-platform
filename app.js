const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { WebSocketServer } = require('ws');
const { initDB, query, get, run, save, sanitize, sanitizeObj } = require('./database.js');
const emailService = require('./emailService');
const pushService = require('./pushService');

const app = express();
const PORT = process.env.PORT || 3000;
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.\u4e00-\u9fa5]/g, '_')),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10mb' }));
app.use(session({
  secret: 'expert-platform-secret-2026',
  resave: false, saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 7 * 24 * 3600 * 1000 },
}));

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: '请先登录' });
  next();
}
function requireAdmin(req, res, next) {
  if (!req.session.userId || req.session.role !== 'admin')
    return res.status(403).json({ error: '需要管理员权限' });
  next();
}
function requireExpert(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: '请先登录' });
  const expert = get('SELECT id FROM experts WHERE user_id = ? AND audit_status = ?', [req.session.userId, 'approved']);
  if (!expert) return res.status(403).json({ error: '需要已审核专家权限' });
  req.expertId = expert.id;
  next();
}

// ===== Auth =====
app.post('/api/register', (req, res) => {
  const { username, password, real_name, phone, email } = sanitizeObj(req.body);
  if (!username || !password) return res.status(400).json({ error: '用户名和密码必填' });
  if (get('SELECT id FROM users WHERE username = ?', [username]))
    return res.status(400).json({ error: '用户名已存在' });
  const hash = bcrypt.hashSync(password, 12);
  run('INSERT INTO users (username, password, real_name, phone, email) VALUES (?, ?, ?, ?, ?)',
    [username, hash, real_name || '', phone || '', email || '']);
  res.json({ success: true });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = get('SELECT * FROM users WHERE username = ?', [username]);
  if (!user) { run('INSERT INTO login_logs (username, ip, success) VALUES (?, ?, 0)', [username, req.ip]); return res.status(400).json({ error: '用户不存在' }); }
  if (user.locked_until && Date.now() < user.locked_until) return res.status(403).json({ error: '账户已锁定，请稍后再试' });
  if (!bcrypt.compareSync(password, user.password)) {
    const attempts = (user.login_attempts || 0) + 1;
    const locked = attempts >= 5 ? Date.now() + 30 * 60 * 1000 : 0;
    run('UPDATE users SET login_attempts = ?, locked_until = ? WHERE id = ?', [attempts, locked, user.id]);
    run('INSERT INTO login_logs (username, ip, success) VALUES (?, ?, 0)', [username, req.ip]);
    return res.status(400).json({ error: attempts >= 5 ? '登录失败5次，账户锁定30分钟' : '密码错误' });
  }
  run('UPDATE users SET login_attempts = 0, locked_until = 0 WHERE id = ?', [user.id]);
  run('INSERT INTO login_logs (username, ip, success) VALUES (?, ?, 1)', [username, req.ip]);
  req.session.userId = user.id; req.session.username = user.username; req.session.role = user.role;
  res.json({ success: true, role: user.role, username: user.username });
});

app.post('/api/logout', (req, res) => { req.session.destroy(() => res.json({ success: true })); });

app.get('/api/me', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: '未登录' });
  const user = get('SELECT id, username, real_name, phone, role FROM users WHERE id = ?', [req.session.userId]);
  const expert = get('SELECT id, audit_status, verified, avg_rating, review_count FROM experts WHERE user_id = ?', [req.session.userId]);
  res.json({ user, expert });
});

app.put('/api/change-password', requireAuth, (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = get('SELECT * FROM users WHERE id = ?', [req.session.userId]);
  if (!bcrypt.compareSync(oldPassword, user.password)) return res.status(400).json({ error: '原密码错误' });
  const hash = bcrypt.hashSync(newPassword, 12);
  run('UPDATE users SET password = ? WHERE id = ?', [hash, req.session.userId]);
  res.json({ success: true });
});

// ===== Push Notifications =====
app.post('/api/push/subscribe', requireAuth, (req, res) => {
  const { subscription } = req.body;
  if (!subscription || !subscription.endpoint) return res.status(400).json({ error: '无效的订阅对象' });
  pushService.saveSubscription(req.session.userId, subscription);
  res.json({ success: true });
});

app.post('/api/push/unsubscribe', requireAuth, (req, res) => {
  const { endpoint } = req.body;
  if (!endpoint) return res.status(400).json({ error: '缺少 endpoint' });
  pushService.removeSubscription(req.session.userId, endpoint);
  res.json({ success: true });
});

app.get('/api/push/vapid-public-key', (req, res) => {
  res.json({ publicKey: pushService.VAPID_KEYS.publicKey });
});

// ===== Experts =====
app.get('/api/experts', (req, res) => {
  const { industry, keyword, page = 1, limit = 12, min_price, max_price, min_rating } = req.query;
  const offset = (page - 1) * limit;
  let where = 'WHERE e.audit_status = "approved"', params = [];
  if (industry) { where += ' AND e.industry = ?'; params.push(industry); }
  if (keyword) { where += ' AND (e.title LIKE ? OR u.real_name LIKE ?)'; params.push('%' + keyword + '%', '%' + keyword + '%');
  if (min_price) { where += ' AND e.consult_fee >= ?'; params.push(Number(min_price)); }
  if (max_price) { where += ' AND e.consult_fee <= ?'; params.push(Number(max_price)); }
  if (min_rating) { where += ' AND e.avg_rating >= ?'; params.push(Number(min_rating)); } }
  const sql = `SELECT e.id, e.user_id, e.industry, e.title, e.self_intro, e.photo_path, e.verified, e.avg_rating, e.review_count, e.consult_fee, e.available, u.real_name, u.phone FROM experts e JOIN users u ON e.user_id = u.id ${where} ORDER BY e.avg_rating DESC, e.review_count DESC LIMIT ? OFFSET ?`;
  const rows = query(sql, [...params, limit, offset]);
  const countRow = get(`SELECT COUNT(*) as total FROM experts e JOIN users u ON e.user_id = u.id ${where}`, params);
  res.json({ list: rows, total: countRow ? countRow.total : 0 });
});

app.get('/api/experts/:id', (req, res) => {
  const expert = get(`SELECT e.*, u.real_name, u.phone FROM experts e JOIN users u ON e.user_id = u.id WHERE e.id = ?`, [req.params.id]);
  if (!expert) return res.status(404).json({ error: '专家不存在' });
  if (req.session.userId !== expert.user_id) {
    run('UPDATE experts SET views = views + 1 WHERE id = ?', [req.params.id]);
  }
  if (req.session.userId) {
    expert.is_favorite = !!get('SELECT id FROM favorites WHERE user_id = ? AND expert_id = ?', [req.session.userId, req.params.id]);
  } else {
    expert.is_favorite = false;
  }
  res.json(expert);
});

app.post('/api/expert/profile', requireAuth, (req, res) => {
  const { industry, title, self_intro, achievements, consult_fee, available } = sanitizeObj(req.body);
  if (!industry) return res.status(400).json({ error: '行业必填' });
  const existing = get('SELECT id, audit_status FROM experts WHERE user_id = ?', [req.session.userId]);
  if (existing && existing.audit_status === 'approved') return res.status(400).json({ error: '已通过审核，如需修改请联系管理员' });
  const fee = parseInt(consult_fee) || 0;
  const avail = available ? 1 : 0;
  if (existing) {
    run(`UPDATE experts SET industry=?, title=?, self_intro=?, achievements=?, consult_fee=?, available=?, audit_status='pending', updated_at=datetime('now') WHERE id=?`,
      [industry, title||'', self_intro||'', achievements||'', fee, avail, existing.id]);
    run('INSERT INTO audit_logs (expert_id, action, operator_id) VALUES (?, ?, ?)', [existing.id, 'resubmit', req.session.userId]);
  } else {
    run(`INSERT INTO experts (user_id, industry, title, self_intro, achievements, consult_fee, available, audit_status) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [req.session.userId, industry, title||'', self_intro||'', achievements||'', fee, avail]);
  }
  res.json({ success: true });
});

app.post('/api/expert/photo', requireAuth, upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: '未上传文件' });
  const expert = get('SELECT id FROM experts WHERE user_id = ?', [req.session.userId]);
  if (!expert) return res.status(400).json({ error: '请先提交专家资料' });
  const relPath = '/uploads/' + req.file.filename;
  run('INSERT INTO expert_photos (expert_id, photo_path) VALUES (?, ?)', [expert.id, relPath]);
  if (!get('SELECT photo_path FROM experts WHERE id = ? AND (photo_path IS NULL OR photo_path = ?)', [expert.id, ''])) {
    run('UPDATE experts SET photo_path = ? WHERE id = ?', [relPath, expert.id]);
  }
  res.json({ success: true, path: relPath });
});

app.delete('/api/expert/photo/:filename', requireAuth, (req, res) => {
  const expert = get('SELECT id FROM experts WHERE user_id = ?', [req.session.userId]);
  if (!expert) return res.status(400).json({ error: '专家不存在' });
  const filename = req.params.filename;
  const relPath = '/uploads/' + filename;
  run('DELETE FROM expert_photos WHERE expert_id = ? AND photo_path = ?', [expert.id, relPath]);
  const physicalPath = path.join(uploadDir, filename);
  try { fs.unlinkSync(physicalPath); } catch(e) {}
  const remaining = get('SELECT photo_path FROM expert_photos WHERE expert_id = ? LIMIT 1', [expert.id]);
  if (remaining) run('UPDATE experts SET photo_path = ? WHERE id = ?', [remaining.photo_path, expert.id]);
  else run('UPDATE experts SET photo_path = ? WHERE id = ?', ['', expert.id]);
  res.json({ success: true });
});

// ===== Reviews =====
app.get('/api/experts/:id/reviews', (req, res) => {
  const list = query(`SELECT r.*, u.username, u.real_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.expert_id = ? ORDER BY r.created_at DESC`, [req.params.id]);
  res.json(list);
});

app.post('/api/experts/:id/review', requireAuth, (req, res) => {
  const { rating, content } = sanitizeObj(req.body);
  if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: '评分必填(1-5)' });
  const expertId = parseInt(req.params.id);
  const userId = req.session.userId;
  const expert = get('SELECT user_id FROM experts WHERE id = ?', [expertId]);
  if (expert && expert.user_id === userId) return res.status(400).json({ error: '不能评价自己' });
  try {
    run('INSERT OR REPLACE INTO reviews (expert_id, user_id, rating, content) VALUES (?, ?, ?, ?)',
      [expertId, userId, rating, content || '']);
    const stats = get('SELECT AVG(rating) as avg, COUNT(*) as cnt FROM reviews WHERE expert_id = ?', [expertId]);
    if (stats) run('UPDATE experts SET avg_rating = ?, review_count = ? WHERE id = ?', [stats.avg || 0, stats.cnt || 0, expertId]);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: '您已经评价过该专家' });
  }
});

app.post('/api/experts/:id/reply', requireExpert, (req, res) => {
  const { reply, review_id } = req.body;
  const expert = get('SELECT id FROM experts WHERE user_id = ?', [req.session.userId]);
  run('UPDATE reviews SET reply = ?, replied_at = datetime("now") WHERE id = ? AND expert_id = ?', [reply, review_id, expert.id]);
  res.json({ success: true });
});

// ===== Favorites =====
app.get('/api/favorites', requireAuth, (req, res) => {
  const list = query(`SELECT e.*, u.real_name, u.phone FROM favorites f JOIN experts e ON f.expert_id = e.id JOIN users u ON e.user_id = u.id WHERE f.user_id = ? ORDER BY f.created_at DESC`, [req.session.userId]);
  res.json(list);
});

app.post('/api/favorites/:expertId', requireAuth, (req, res) => {
  try {
    run('INSERT INTO favorites (user_id, expert_id) VALUES (?, ?)', [req.session.userId, req.params.expertId]);
    res.json({ success: true });
  } catch (e) { res.status(400).json({ error: '已收藏' }); }
});

app.delete('/api/favorites/:expertId', requireAuth, (req, res) => {
  run('DELETE FROM favorites WHERE user_id = ? AND expert_id = ?', [req.session.userId, req.params.expertId]);
  res.json({ success: true });
});

// ===== Bookings / Orders =====
app.get('/api/bookings', requireAuth, (req, res) => {
  const list = query(`SELECT b.*, e.title as expert_title, u1.real_name as expert_name, u2.real_name as user_name
    FROM bookings b
    JOIN experts e ON b.expert_id = e.id
    JOIN users u1 ON e.user_id = u1.id
    JOIN users u2 ON b.user_id = u2.id
    WHERE b.user_id = ? OR e.user_id = ?
    ORDER BY b.created_at DESC`, [req.session.userId, req.session.userId]);
  res.json(list);
});

// Create booking - status: pending_payment
app.post('/api/bookings', requireAuth, (req, res) => {
  const { expert_id, booking_date, booking_time, duration, topic } = sanitizeObj(req.body);
  if (!expert_id || !booking_date || !booking_time) return res.status(400).json({ error: '缺少必要信息' });
  const expert = get('SELECT user_id, consult_fee FROM experts WHERE id = ? AND audit_status = ?', [expert_id, 'approved']);
  if (!expert) return res.status(400).json({ error: '专家不存在或未通过审核' });
  if (expert.user_id === req.session.userId) return res.status(400).json({ error: '不能预约自己' });
  const amount = expert.consult_fee || 0;
  // 30分钟支付超时
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  const bookingId = run(`INSERT INTO bookings (expert_id, user_id, booking_date, booking_time, duration, topic, status, amount, expires_at) VALUES (?, ?, ?, ?, ?, ?, 'pending_payment', ?, ?)`,
    [expert_id, req.session.userId, booking_date, booking_time, parseInt(duration)||60, topic||'', amount, expiresAt]).lastInsertRowId;
  // 记录已被占用的时段（防止重复预约）
  run('INSERT OR IGNORE INTO expert_booked_slots (expert_id, booking_date, start_time, end_time, booking_id) VALUES (?, ?, ?, ?, ?)',
    [expert_id, booking_date, booking_time, booking_time, bookingId]);
  res.json({ success: true, booking_id: bookingId, amount: amount, status: 'pending_payment', expires_at: expiresAt });
});

// Initiate payment (mock)
app.post('/api/bookings/:id/pay', requireAuth, (req, res) => {
  const booking = get('SELECT * FROM bookings WHERE id = ? AND user_id = ?', [req.params.id, req.session.userId]);
  if (!booking) return res.status(404).json({ error: '订单不存在' });
  if (booking.status !== 'pending_payment') return res.status(400).json({ error: '订单状态不正确' });
  // Calculate platform fee (default 15%)
  const commissionRate = parseFloat(get('SELECT value FROM platform_config WHERE key = ?', ['commission_rate'])?.value || '0.15');
  const amount = booking.amount || 0;
  const platformFee = Math.round(amount * commissionRate);
  const expertIncome = amount - platformFee;
  // Mock payment - directly mark as paid
  const paymentId = run(`INSERT INTO payments (booking_id, user_id, amount, method, status, paid_at) VALUES (?, ?, ?, 'mock', 'success', datetime('now'))`,
    [booking.id, req.session.userId, amount]).lastInsertRowId;
  run(`UPDATE bookings SET status = 'paid', paid_at = datetime('now'), payment_method = 'mock', platform_fee = ?, expert_income = ? WHERE id = ?`, [platformFee, expertIncome, booking.id]);
  // Credit expert wallet
  const expert = get('SELECT id, user_id FROM experts WHERE id = ?', [booking.expert_id]);
  if (expert) {
    // Ensure wallet exists
    let wallet = get('SELECT * FROM expert_wallet WHERE expert_id = ?', [expert.id]);
    if (!wallet) run('INSERT INTO expert_wallet (expert_id, balance, total_income) VALUES (?, 0, 0)', [expert.id]);
    // Add income to wallet (will be available after order completed)
    // For now, credit immediately; in production, credit after completion
    run('UPDATE expert_wallet SET balance = balance + ?, total_income = total_income + ?, updated_at = datetime("now") WHERE expert_id = ?', [expertIncome, expertIncome, expert.id]);
    // Notify expert
    run('INSERT INTO notifications (user_id, type, title, content, related_id) VALUES (?, ?, ?, ?, ?)',
      [expert.user_id, 'booking', '新预约待确认', `有用户支付了咨询费用 ¥${amount}，您的收入 ¥${expertIncome}`, booking.id]);
  }
  // Notify user
  run('INSERT INTO notifications (user_id, type, title, content, related_id) VALUES (?, ?, ?, ?, ?)',
    [req.session.userId, 'booking_update', '支付成功', `您已支付 ¥${amount}，平台手续费 ¥${platformFee}`, booking.id]);
  save();
  res.json({ success: true, status: 'paid', platform_fee: platformFee, expert_income: expertIncome });
});

// Expert confirms / rejects booking
app.put('/api/bookings/:id', requireAuth, (req, res) => {
  const { status, reject_reason } = req.body;
  const booking = get('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
  if (!booking) return res.status(404).json({ error: '预约不存在' });
  const expert = get('SELECT id FROM experts WHERE user_id = ?', [req.session.userId]);
  if (!expert || expert.id != booking.expert_id) {
    if (req.session.role !== 'admin') return res.status(403).json({ error: '无权操作' });
  }
  if (status === 'confirmed' && booking.status !== 'paid') return res.status(400).json({ error: '请先完成支付' });
  run('UPDATE bookings SET status = ?, reject_reason = ?, updated_at = datetime("now") WHERE id = ?', [status, reject_reason || '', req.params.id]);
  run('INSERT INTO notifications (user_id, type, title, content, related_id) VALUES (?, ?, ?, ?, ?)',
    [booking.user_id, 'booking_update', '预约状态更新', `您的预约已${status === 'confirmed' ? '确认' : status === 'rejected' ? '被拒绝' : status}`, booking.id]);
  // 邮件通知（非阻塞）
  emailService.notifyBookingUpdate(booking.id, status).catch(e => console.error('邮件发送失败:', e.message));
  // 推送通知（非阻塞）
  pushService.sendPushNotification(booking.user_id, {
    title: '预约状态更新',
    body: `您的预约已${status === 'confirmed' ? '确认' : '被拒绝'}`,
    url: '/',
    tag: 'booking-' + booking.id
  }).catch(e => console.error('推送失败:', e.message));
  res.json({ success: true });
});

// Mark booking as completed (after consultation)
app.post('/api/bookings/:id/complete', requireAuth, (req, res) => {
  const booking = get('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
  if (!booking) return res.status(404).json({ error: '订单不存在' });
  // Only expert or admin can mark as completed
  const expert = get('SELECT id FROM experts WHERE user_id = ?', [req.session.userId]);
  if (!expert || expert.id != booking.expert_id) {
    if (req.session.role !== 'admin') return res.status(403).json({ error: '无权操作' });
  }
  if (booking.status !== 'confirmed') return res.status(400).json({ error: '只有已确认的预约才能标记为完成' });
  run('UPDATE bookings SET status = ? WHERE id = ?', ['completed', req.params.id]);
  run('INSERT INTO notifications (user_id, type, title, content, related_id) VALUES (?, ?, ?, ?, ?)',
    [booking.user_id, 'booking_complete', '咨询完成', '您的咨询已完成，欢迎评价', booking.id]);
  res.json({ success: true });
});

// Request refund
app.post('/api/bookings/:id/refund', requireAuth, (req, res) => {
  const { reason } = sanitizeObj(req.body);
  const booking = get('SELECT * FROM bookings WHERE id = ? AND user_id = ?', [req.params.id, req.session.userId]);
  if (!booking) return res.status(404).json({ error: '订单不存在' });
  if (booking.status !== 'paid' && booking.status !== 'confirmed') return res.status(400).json({ error: '当前状态不可退款' });
  run('UPDATE bookings SET status = ? WHERE id = ?', ['refunding', req.params.id]);
  run(`INSERT INTO refunds (booking_id, user_id, amount, reason, status) VALUES (?, ?, ?, ?, 'pending')`,
    [booking.id, req.session.userId, booking.amount || 0, reason || '']);
  // Notify admin
  const admin = get('SELECT id FROM users WHERE role = ?', ['admin']);
  if (admin) {
    run('INSERT INTO notifications (user_id, type, title, content, related_id) VALUES (?, ?, ?, ?, ?)',
      [admin.id, 'refund', '退款申请', `用户申请退款，订单ID：${booking.id}，原因：${reason || '未填写'}`, booking.id]);
  }
  res.json({ success: true, status: 'refunding' });
});

// ===== Payments =====
app.get('/api/payments', requireAuth, (req, res) => {
  const list = query('SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC', [req.session.userId]);
  res.json(list);
});

// ===== Refunds (Admin) =====
app.get('/api/admin/refunds', requireAdmin, (req, res) => {
  const list = query(`SELECT r.*, b.expert_id, b.booking_date, b.topic, u.username FROM refunds r
    JOIN bookings b ON r.booking_id = b.id
    JOIN users u ON r.user_id = u.id
    ORDER BY r.created_at DESC`);
  res.json(list);
});

app.post('/api/admin/refunds/:id/approve', requireAdmin, (req, res) => {
  const refund = get('SELECT * FROM refunds WHERE id = ?', [req.params.id]);
  if (!refund) return res.status(404).json({ error: '退款申请不存在' });
  if (refund.status !== 'pending') return res.status(400).json({ error: '已处理' });
  run('UPDATE refunds SET status = ?, processed_at = datetime("now") WHERE id = ?', ['approved', req.params.id]);
  run('UPDATE bookings SET status = ?, refunded_at = datetime("now") WHERE id = ?', ['refunded', refund.booking_id]);
  run('INSERT INTO notifications (user_id, type, title, content, related_id) VALUES (?, ?, ?, ?, ?)',
    [refund.user_id, 'refund', '退款通过', `您的退款申请已通过，金额：¥${refund.amount}`, refund.booking_id]);
  // 邮件通知（非阻塞）
  emailService.notifyRefund(refund.id).catch(e => console.error('邮件发送失败:', e.message));
  // 推送通知（非阻塞）
  pushService.sendPushNotification(refund.user_id, {
    title: '退款通知',
    body: `您的退款申请已通过，金额：¥${refund.amount}`,
    url: '/',
    tag: 'refund-' + refund.id
  }).catch(e => console.error('推送失败:', e.message));
  res.json({ success: true });
});

app.post('/api/admin/refunds/:id/reject', requireAdmin, (req, res) => {
  const { reason } = req.body;
  const refund = get('SELECT * FROM refunds WHERE id = ?', [req.params.id]);
  if (!refund) return res.status(404).json({ error: '退款申请不存在' });
  if (refund.status !== 'pending') return res.status(400).json({ error: '已处理' });
  run('UPDATE refunds SET status = ?, processed_at = datetime("now") WHERE id = ?', ['rejected', req.params.id]);
  run('UPDATE bookings SET status = ? WHERE id = ?', ['paid', refund.booking_id]);
  run('INSERT INTO notifications (user_id, type, title, content, related_id) VALUES (?, ?, ?, ?, ?)',
    [refund.user_id, 'refund', '退款被驳回', `您的退款申请被驳回，原因：${reason || '未说明'}`, refund.booking_id]);
  res.json({ success: true });
});

// ===== Messages =====
app.get('/api/messages', requireAuth, (req, res) => {
  const list = query(`SELECT m.*, u1.username as from_username, u1.real_name as from_name, u2.username as to_username
    FROM messages m
    JOIN users u1 ON m.from_user = u1.id
    JOIN users u2 ON m.to_user = u2.id
    WHERE m.to_user = ? OR m.from_user = ?
    ORDER BY m.created_at DESC LIMIT 200`, [req.session.userId, req.session.userId]);
  res.json(list);
});

app.post('/api/messages', requireAuth, (req, res) => {
  const { to_user, content } = sanitizeObj(req.body);
  if (!to_user || !content) return res.status(400).json({ error: '收件人和内容必填' });
  run('INSERT INTO messages (from_user, to_user, content) VALUES (?, ?, ?)', [req.session.userId, to_user, content]);
  run('INSERT INTO notifications (user_id, type, title, content, related_id) VALUES (?, ?, ?, ?, ?)',
    [to_user, 'message', '新消息', '您收到一条新消息', req.session.userId]);
  res.json({ success: true });
});

app.put('/api/messages/read', requireAuth, (req, res) => {
  run('UPDATE messages SET is_read = 1 WHERE to_user = ? AND is_read = 0', [req.session.userId]);
  res.json({ success: true });
});

// ===== Notifications =====
app.get('/api/notifications', requireAuth, (req, res) => {
  const list = query('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 100', [req.session.userId]);
  res.json(list);
});

app.get('/api/notifications/unread-count', requireAuth, (req, res) => {
  const row = get('SELECT COUNT(*) as cnt FROM notifications WHERE user_id = ? AND is_read = 0', [req.session.userId]);
  res.json({ count: row ? row.cnt : 0 });
});

app.put('/api/notifications/read', requireAuth, (req, res) => {
  const { ids } = req.body;
  if (ids && ids.length) {
    const placeholders = ids.map(() => '?').join(',');
    run(`UPDATE notifications SET is_read = 1 WHERE user_id = ? AND id IN (${placeholders})`, [req.session.userId, ...ids]);
  } else {
    run('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.session.userId]);
  }
  res.json({ success: true });
});

// ===== Verifications =====
app.get('/api/verification', requireAuth, (req, res) => {
  const v = get('SELECT * FROM verifications WHERE user_id = ? ORDER BY submitted_at DESC LIMIT 1', [req.session.userId]);
  res.json(v || null);
});

app.post('/api/verification', requireAuth, (req, res) => {
  const { real_name, id_number } = sanitizeObj(req.body);
  if (!real_name || !id_number) return res.status(400).json({ error: '姓名和身份证号必填' });
  const existing = get('SELECT id FROM verifications WHERE user_id = ? AND status = "pending"', [req.session.userId]);
  if (existing) return res.status(400).json({ error: '已有待审核的认证申请' });
  run('INSERT INTO verifications (user_id, real_name, id_number) VALUES (?, ?, ?)', [req.session.userId, real_name, id_number]);
  res.json({ success: true });
});

app.post('/api/verification/:id/approve', requireAdmin, (req, res) => {
  run('UPDATE verifications SET status = "approved", reviewed_at = datetime("now"), reviewer_id = ? WHERE id = ?', [req.session.userId, req.params.id]);
  const v = get('SELECT user_id FROM verifications WHERE id = ?', [req.params.id]);
  if (v) {
    run('UPDATE experts SET verified = 1 WHERE user_id = ?', [v.user_id]);
    run('INSERT INTO notifications (user_id, type, title, content) VALUES (?, ?, ?, ?)', [v.user_id, 'verification', '认证通过', '您的实名认证已通过']);
  }
  res.json({ success: true });
});

app.post('/api/verification/:id/reject', requireAdmin, (req, res) => {
  const { remark } = req.body;
  run('UPDATE verifications SET status = "rejected", remark = ?, reviewed_at = datetime("now"), reviewer_id = ? WHERE id = ?', [remark || '', req.session.userId, req.params.id]);
  const v = get('SELECT user_id FROM verifications WHERE id = ?', [req.params.id]);
  if (v) run('INSERT INTO notifications (user_id, type, title, content) VALUES (?, ?, ?, ?)', [v.user_id, 'verification', '认证未通过', remark || '请重新提交认证信息']);
  res.json({ success: true });
});

// ===== Articles =====
app.get('/api/experts/:id/articles', (req, res) => {
  const list = query('SELECT * FROM articles WHERE expert_id = ? AND status = "published" ORDER BY created_at DESC', [req.params.id]);
  res.json(list);
});

app.get('/api/articles/:id', (req, res) => {
  const article = get('SELECT * FROM articles WHERE id = ?', [req.params.id]);
  if (article) run('UPDATE articles SET views = views + 1 WHERE id = ?', [req.params.id]);
  res.json(article || null);
});

app.post('/api/articles', requireExpert, (req, res) => {
  const { title, content, status } = sanitizeObj(req.body);
  if (!title || !content) return res.status(400).json({ error: '标题和内容必填' });
  const expert = get('SELECT id FROM experts WHERE user_id = ?', [req.session.userId]);
  run('INSERT INTO articles (expert_id, title, content, status) VALUES (?, ?, ?, ?)', [expert.id, title, content, status || 'published']);
  res.json({ success: true });
});

app.put('/api/articles/:id', requireExpert, (req, res) => {
  const { title, content, status } = sanitizeObj(req.body);
  const expert = get('SELECT id FROM experts WHERE user_id = ?', [req.session.userId]);
  run('UPDATE articles SET title = ?, content = ?, status = ?, updated_at = datetime("now") WHERE id = ? AND expert_id = ?', [title, content, status || 'published', req.params.id, expert.id]);
  res.json({ success: true });
});

app.delete('/api/articles/:id', requireExpert, (req, res) => {
  const expert = get('SELECT id FROM experts WHERE user_id = ?', [req.session.userId]);
  run('DELETE FROM articles WHERE id = ? AND expert_id = ?', [req.params.id, expert.id]);
  res.json({ success: true });
});

// ===== Admin =====
app.get('/api/admin/stats', requireAdmin, (req, res) => {
  const users = get('SELECT COUNT(*) as c FROM users') || { c: 0 };
  const approved = get('SELECT COUNT(*) as c FROM experts WHERE audit_status = "approved"') || { c: 0 };
  const pending = get('SELECT COUNT(*) as c FROM experts WHERE audit_status = "pending"') || { c: 0 };
  const today = get(`SELECT COUNT(*) as c FROM login_logs WHERE success = 1 AND date(created_at) = date('now')`) || { c: 0 };
  const abnormal = get('SELECT COUNT(*) as c FROM users WHERE login_attempts >= 3') || { c: 0 };
  const totalOrders = get('SELECT COUNT(*) as c FROM bookings') || { c: 0 };
  const paidOrders = get('SELECT COUNT(*) as c FROM bookings WHERE status IN ("paid","confirmed","completed")') || { c: 0 };
  res.json({ users: users.c, approved: approved.c, pending: pending.c, today_login: today.c, abnormal_login: abnormal.c, total_orders: totalOrders.c, paid_orders: paidOrders.c });
});

app.get('/api/admin/experts/pending', requireAdmin, (req, res) => {
  const list = query(`SELECT e.*, u.username, u.real_name, u.phone FROM experts e JOIN users u ON e.user_id = u.id WHERE e.audit_status = ?`, ['pending']);
  res.json(list);
});

app.post('/api/admin/experts/:id/audit', requireAdmin, (req, res) => {
  const { action, remark } = req.body;
  const expertId = req.params.id;
  const statusMap = { approve: 'approved', reject: 'rejected', resubmit: 'resubmit' };
  const newStatus = statusMap[action];
  if (!newStatus) return res.status(400).json({ error: '无效操作' });
  run('UPDATE experts SET audit_status = ?, audit_remark = ?, audited_at = datetime("now"), audited_by = ? WHERE id = ?', [newStatus, remark || '', req.session.userId, expertId]);
  run('INSERT INTO audit_logs (expert_id, action, remark, operator_id) VALUES (?, ?, ?, ?)', [expertId, action, remark || '', req.session.userId]);
  const expert = get('SELECT user_id FROM experts WHERE id = ?', [expertId]);
  if (expert) {
    const msgs = { approve: '审核通过，您的专家资料已公开展示', reject: '审核未通过：' + (remark || ''), resubmit: '请补充修改资料：' + (remark || '') };
    run('INSERT INTO notifications (user_id, type, title, content) VALUES (?, ?, ?, ?)', [expert.user_id, 'audit', '审核结果', msgs[action] || '']);
    // 邮件通知（非阻塞）
    emailService.notifyAuditResult(expert.user_id, newStatus, remark).catch(e => console.error('邮件发送失败:', e.message));
    // 推送通知（非阻塞）
    const auditMsgs = { approve: '审核通过，您的专家资料已公开展示', reject: '审核未通过：' + (remark || ''), resubmit: '请补充修改资料：' + (remark || '') };
    pushService.sendPushNotification(expert.user_id, {
      title: '审核结果',
      body: auditMsgs[action] || '审核结果已更新',
      url: '/',
      tag: 'audit-' + expertId
    }).catch(e => console.error('推送失败:', e.message));
  }
  res.json({ success: true });
});

app.get('/api/admin/verifications', requireAdmin, (req, res) => {
  const list = query(`SELECT v.*, u.username, u.real_name as user_real_name FROM verifications v JOIN users u ON v.user_id = u.id ORDER BY v.submitted_at DESC`);
  res.json(list);
});

app.get('/api/admin/logs', requireAdmin, (req, res) => {
  const list = query(`SELECT l.*, u.username FROM login_logs l LEFT JOIN users u ON l.username = u.username ORDER BY l.created_at DESC LIMIT 200`);
  res.json(list);
});

app.get('/api/admin/users', requireAdmin, (req, res) => {
  const list = query('SELECT id, username, real_name, phone, role, status, created_at FROM users ORDER BY id');
  res.json(list);
});

app.put('/api/admin/users/:id/toggle', requireAdmin, (req, res) => {
  const user = get('SELECT status FROM users WHERE id = ?', [req.params.id]);
  const newStatus = user.status === 'active' ? 'disabled' : 'active';
  run('UPDATE users SET status = ? WHERE id = ?', [newStatus, req.params.id]);
  res.json({ success: true, status: newStatus });
});

// Admin: view all orders
app.get('/api/admin/orders', requireAdmin, (req, res) => {
  const list = query(`SELECT b.*, e.title as expert_title, u1.real_name as expert_name, u2.real_name as user_name
    FROM bookings b
    JOIN experts e ON b.expert_id = e.id
    JOIN users u1 ON e.user_id = u1.id
    JOIN users u2 ON b.user_id = u2.id
    ORDER BY b.created_at DESC LIMIT 200`);
  res.json(list);
});

// ===== Expert Wallet & Withdrawals =====
app.get('/api/expert/wallet', requireExpert, (req, res) => {
  let wallet = get('SELECT * FROM expert_wallet WHERE expert_id = ?', [req.expertId]);
  if (!wallet) {
    run('INSERT INTO expert_wallet (expert_id, balance, total_income, total_withdrawn) VALUES (?,0,0,0)', [req.expertId]);
    wallet = get('SELECT * FROM expert_wallet WHERE expert_id = ?', [req.expertId]);
  }
  const pending = query('SELECT SUM(amount) as total FROM withdrawals WHERE expert_id = ? AND status = "pending"', [req.expertId]);
  wallet.pending_withdrawal = pending && pending[0] ? (pending[0].total || 0) : 0;
  res.json(wallet);
});

app.post('/api/expert/withdraw', requireExpert, (req, res) => {
  const { amount, account_name, account_number, bank_name } = sanitizeObj(req.body);
  if (!amount || amount <= 0) return res.status(400).json({ error: '提现金额不正确' });
  const wallet = get('SELECT * FROM expert_wallet WHERE expert_id = ?', [req.expertId]);
  if (!wallet || wallet.balance < amount) return res.status(400).json({ error: '余额不足' });
  run('UPDATE expert_wallet SET balance = balance - ?, updated_at = datetime("now") WHERE expert_id = ?', [amount, req.expertId]);
  const wId = run(`INSERT INTO withdrawals (expert_id, amount, account_name, account_number, bank_name, status) VALUES (?, ?, ?, ?, ?, 'pending')`,
    [req.expertId, amount, account_name || '', account_number || '', bank_name || '']).lastInsertRowId;
  const admin = get('SELECT id FROM users WHERE role = ?', ['admin']);
  if (admin) {
    run('INSERT INTO notifications (user_id, type, title, content) VALUES (?, ?, ?, ?)',
      [admin.id, 'withdrawal', '提现申请', `专家ID ${req.expertId} 申请提现 ¥${amount}`]);
  }
  save();
  res.json({ success: true });
});

app.get('/api/expert/withdrawals', requireExpert, (req, res) => {
  const list = query('SELECT * FROM withdrawals WHERE expert_id = ? ORDER BY created_at DESC', [req.expertId]);
  res.json(list);
});

// ===== Admin: Withdrawals & Platform Config =====
app.get('/api/admin/withdrawals', requireAdmin, (req, res) => {
  const list = query(`SELECT w.*, u.username, u.real_name FROM withdrawals w
    JOIN experts e ON w.expert_id = e.id
    JOIN users u ON e.user_id = u.id
    ORDER BY w.created_at DESC`);
  res.json(list);
});

app.post('/api/admin/withdrawals/:id/approve', requireAdmin, (req, res) => {
  const w = get('SELECT * FROM withdrawals WHERE id = ?', [req.params.id]);
  if (!w) return res.status(404).json({ error: '提现申请不存在' });
  if (w.status !== 'pending') return res.status(400).json({ error: '已处理' });
  run('UPDATE withdrawals SET status = "approved", processed_at = datetime("now") WHERE id = ?', [req.params.id]);
  run('UPDATE expert_wallet SET total_withdrawn = total_withdrawn + ?, updated_at = datetime("now") WHERE expert_id = ?', [w.amount, w.expert_id]);
  const expert = get('SELECT user_id FROM experts WHERE id = ?', [w.expert_id]);
  if (expert) {
    run('INSERT INTO notifications (user_id, type, title, content) VALUES (?, ?, ?, ?)',
      [expert.user_id, 'withdrawal', '提现通过', `您的提现申请 ¥${w.amount} 已通过，请注意查收`]);
    // 邮件通知（非阻塞）
    emailService.notifyWithdrawal(w.id).catch(e => console.error('邮件发送失败:', e.message));
    // 推送通知（非阻塞）
    pushService.sendPushNotification(expert.user_id, {
      title: '提现处理通知',
      body: `您的提现申请 ¥${w.amount} 已通过，请注意查收`,
      url: '/',
      tag: 'withdrawal-' + w.id
    }).catch(e => console.error('推送失败:', e.message));
  }
  save();
  res.json({ success: true });
});

app.post('/api/admin/withdrawals/:id/reject', requireAdmin, (req, res) => {
  const { remark } = req.body;
  const w = get('SELECT * FROM withdrawals WHERE id = ?', [req.params.id]);
  if (!w) return res.status(404).json({ error: '提现申请不存在' });
  if (w.status !== 'pending') return res.status(400).json({ error: '已处理' });
  run('UPDATE withdrawals SET status = "rejected", remark = ?, processed_at = datetime("now") WHERE id = ?', [remark || '', req.params.id]);
  run('UPDATE expert_wallet SET balance = balance + ?, updated_at = datetime("now") WHERE expert_id = ?', [w.amount, w.expert_id]);
  const expert = get('SELECT user_id FROM experts WHERE id = ?', [w.expert_id]);
  if (expert) {
    run('INSERT INTO notifications (user_id, type, title, content) VALUES (?, ?, ?, ?)',
      [expert.user_id, 'withdrawal', '提现被驳回', `您的提现申请被驳回：${remark || '未说明'}`]);
  }
  save();
  res.json({ success: true });
});

// Platform config
app.get('/api/admin/config/:key', requireAdmin, (req, res) => {
  const row = get('SELECT value FROM platform_config WHERE key = ?', [req.params.key]);
  res.json({ value: row ? row.value : null });
});

app.put('/api/admin/config/:key', requireAdmin, (req, res) => {
  const { value } = req.body;
  if (value === undefined) return res.status(400).json({ error: 'value required' });
  const existing = get('SELECT key FROM platform_config WHERE key = ?', [req.params.key]);
  if (existing) {
    run('UPDATE platform_config SET value = ?, updated_at = datetime("now") WHERE key = ?', [String(value), req.params.key]);
  } else {
    run('INSERT INTO platform_config (key, value) VALUES (?, ?)', [req.params.key, String(value)]);
  }
  save();
  res.json({ success: true });
});

// Revenue stats
app.get('/api/admin/revenue', requireAdmin, (req, res) => {
  const totalRevenue = get('SELECT SUM(platform_fee) as total FROM bookings WHERE status IN ("paid","confirmed","completed")') || { total: 0 };
  const totalPaidOut = get('SELECT SUM(amount) as total FROM withdrawals WHERE status = "approved"') || { total: 0 };
  const pendingWithdrawals = get('SELECT SUM(amount) as total FROM withdrawals WHERE status = "pending"') || { total: 0 };
  const commissionRate = get('SELECT value FROM platform_config WHERE key = "commission_rate"')?.value || '0.15';
  const completed = get('SELECT COUNT(*) as c, SUM(amount) as total FROM bookings WHERE status = "completed"') || { c: 0, total: 0 };
  res.json({
    total_revenue: totalRevenue.total || 0,
    total_paid_out: totalPaidOut.total || 0,
    pending_withdrawals: pendingWithdrawals.total || 0,
    commission_rate: parseFloat(commissionRate),
    completed_orders: completed.c || 0,
    completed_amount: completed.total || 0,
  });
});

// ===== Serve SPA =====

// ===== Service Packages API =====

// 专家查看自己的服务套餐
app.get('/api/expert/packages', requireAuth, requireExpert, (req, res) => {
  const list = db.query(
    'SELECT * FROM service_packages WHERE expert_id = ? AND is_active = 1',
    [req.expert.id]
  );
  res.json(list);
});

// 专家创建服务套餐
app.post('/api/expert/packages', requireAuth, requireExpert, (req, res) => {
  const { name, description, price, duration } = req.body;
  if (!name || !price) return res.json({ success: false, message: '名称和价格为必填项' });
  const r = db.run(
    'INSERT INTO service_packages (expert_id, name, description, price, duration) VALUES (?, ?, ?, ?, ?)',
    [req.expert.id, name, description || '', parseInt(price) || 0, parseInt(duration) || 60]
  );
  res.json({ success: true, id: r.lastInsertRowId });
});

// 专家更新服务套餐
app.put('/api/expert/packages/:id', requireAuth, requireExpert, (req, res) => {
  const { name, description, price, duration, is_active } = req.body;
  // 验证套餐属于该专家
  const pkg = db.get('SELECT * FROM service_packages WHERE id = ? AND expert_id = ?', [req.params.id, req.expert.id]);
  if (!pkg) return res.json({ success: false, message: '套餐不存在或无权限' });
  const fields = [];
  const params = [];
  if (name !== undefined) { fields.push('name = ?'); params.push(name); }
  if (description !== undefined) { fields.push('description = ?'); params.push(description); }
  if (price !== undefined) { fields.push('price = ?'); params.push(parseInt(price) || 0); }
  if (duration !== undefined) { fields.push('duration = ?'); params.push(parseInt(duration) || 60); }
  if (is_active !== undefined) { fields.push('is_active = ?'); params.push(is_active ? 1 : 0); }
  fields.push("updated_at = datetime('now')");
  params.push(req.params.id);
  db.run('UPDATE service_packages SET ' + fields.join(', ') + ' WHERE id = ?', params);
  res.json({ success: true });
});

// 专家删除（停用）服务套餐
app.delete('/api/expert/packages/:id', requireAuth, requireExpert, (req, res) => {
  const pkg = db.get('SELECT * FROM service_packages WHERE id = ? AND expert_id = ?', [req.params.id, req.expert.id]);
  if (!pkg) return res.json({ success: false, message: '套餐不存在或无权限' });
  db.run('UPDATE service_packages SET is_active = 0 WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// 公开：查看某专家的服务套餐（预约时选择）
app.get('/api/experts/:id/packages', (req, res) => {
  const list = db.query(
    'SELECT id, name, description, price, duration FROM service_packages WHERE expert_id = ? AND is_active = 1',
    [req.params.id]
  );
  res.json(list);
});



// Expert rating & ranking routes
require('./routes/rating.js')(app, requireAuth, requireExpert);

// ===== Coupons =====
app.get('/api/coupons/mine', requireAuth, (req, res) => {
  const list = query('SELECT * FROM coupons WHERE user_id = ? ORDER BY created_at DESC', [req.session.userId]);
  res.json({ list });
});

app.post('/api/coupons/claim', requireAuth, (req, res) => {
  const existing = get('SELECT id FROM coupons WHERE user_id = ? AND status = ?', [req.session.userId, 'active']);
  if (existing) return res.json({ error: '您已领取过优惠券' });
  const count = get('SELECT COUNT(*) as c FROM coupons WHERE status = ?', ['active']);
  if (count && count.c >= 500) return res.json({ error: '优惠券已抢完' });
  run('INSERT INTO coupons (user_id, amount, min_amount, status) VALUES (?, 20, 0, ?)', [req.session.userId, 'active']);
  res.json({ success: true });
});

// P0 features: schedule, order-linked reviews, auto-cancel
require('./p0_routes.js')(app, requireAuth, requireExpert, sanitizeObj);

// P1+P2+P3 features
const p1p2Routes = require('./p1_p2_routes.js');
app.use('/api', p1p2Routes);
const registerTaskRoutes = require('./register_task_routes.js');
app.use('/api', registerTaskRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

initDB().then(() => {
  // ===== WebSocket 实时通知服务器 (P1) =====
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });

  // 存储在线连接 { userId: ws }
  const onlineUsers = new Map();

  wss.on('connection', (ws, req) => {
    let userId = null;
    // 从 session 解析 userId（简易方案：前端连接时发送 userId）
    ws.on('message', (msg) => {
      try {
        const data = JSON.parse(msg);
        if (data.type === 'auth' && data.userId) {
          userId = data.userId;
          onlineUsers.set(userId, ws);
          ws.send(JSON.stringify({ type: 'connected', userId }));
          console.log('[WS] 用户上线:', userId);
        }
        if (data.type === 'mark_read' && data.notificationId) {
          run('UPDATE notifications SET is_read = 1 WHERE id = ?', [data.notificationId]);
        }
      } catch(e) {}
    });
    ws.on('close', () => {
      if (userId) { onlineUsers.delete(userId); console.log('[WS] 用户离线:', userId); }
    });
  });

  // 实时推送通知的辅助函数（供各 API 调用）
  function pushNotification(userId, notification) {
    const ws = onlineUsers.get(userId);
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify({ type: 'notification', data: notification }));
      return true;
    }
    return false; // 用户离线，走原有轮询
  }
  app.set('pushNotification', pushNotification);
  app.set('onlineUsers', onlineUsers);

  // 订单超时自动取消 (P0 #3)
  function cancelExpiredOrders() {
    const now = new Date().toISOString();
    const expired = query(
      "SELECT id, user_id FROM bookings WHERE status = 'pending_payment' AND expires_at IS NOT NULL AND expires_at < ?",
      [now]
    );
    let count = 0;
    for (const b of expired) {
      run('UPDATE bookings SET status = ?, updated_at = datetime("now") WHERE id = ?', ['cancelled', b.id]);
      run(
        'INSERT INTO notifications (user_id, type, title, content, related_id) VALUES (?, ?, ?, ?, ?)',
        [b.user_id, 'booking_update', '预约已取消', '支付超时，预约已自动取消', b.id]
      );
      const slots = query('SELECT * FROM expert_booked_slots WHERE booking_id = ?', [b.id]);
      for (const s of slots) {
        run('DELETE FROM expert_booked_slots WHERE id = ?', [s.id]);
      }
      count++;
    }
    if (count > 0) { save(); console.log('[Auto-Cancel] 已取消 ' + count + ' 个超时预约'); }
  }
  setInterval(cancelExpiredOrders, 5 * 60 * 1000);
  cancelExpiredOrders();

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`专家平台已启动: http://localhost:${PORT} (WebSocket ON)`);
  });
}).catch(err => {
  console.error('数据库初始化失败:', err);
  process.exit(1);
});
