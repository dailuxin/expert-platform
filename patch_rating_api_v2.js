// 给 app.js 注入专家评分 + 排名 API（避免模板字符串）
const fs = require('fs');
const path = process.argv[2] || './app.js';
let c = fs.readFileSync(path, 'utf8');

const spaIdx = c.lastIndexOf("app.get('*'");
if (spaIdx === -1) { console.log('未找到 SPA 路由'); process.exit(1); }

const apis = `
// ===== Expert Rating & Ranking API =====

// 提交评分/评价
app.post('/api/experts/:id/reviews', requireAuth, (req, res) => {
  const { rating, content } = req.body;
  if (!rating || rating < 1 || rating > 5) return res.json({ success: false, message: '评分必须在 1-5 之间' });
  const expert = db.get('SELECT id FROM experts WHERE id = ? AND audit_status = ?', [req.params.id, 'approved']);
  if (!expert) return res.json({ success: false, message: '专家不存在或未通过审核' });
  const existing = db.get('SELECT id FROM reviews WHERE expert_id = ? AND user_id = ?', [req.params.id, req.user.id]);
  if (existing) return res.json({ success: false, message: '您已评价过该专家' });
  db.run(
    'INSERT INTO reviews (expert_id, user_id, rating, content) VALUES (?, ?, ?, ?)',
    [req.params.id, req.user.id, parseInt(rating), (content || '').slice(0, 500)]
  );
  const stats = db.get('SELECT AVG(rating) as avg, COUNT(*) as cnt FROM reviews WHERE expert_id = ?', [req.params.id]);
  db.run('UPDATE experts SET avg_rating = ?, review_count = ? WHERE id = ?', [stats.avg || 0, stats.cnt || 0, req.params.id]);
  res.json({ success: true });
});

// 获取专家的评价列表
app.get('/api/experts/:id/reviews', (req, res) => {
  const list = db.query(
    'SELECT r.id, r.rating, r.content, r.reply, r.replied_at, r.created_at, u.real_name as user_name FROM reviews r JOIN users u ON u.id = r.user_id WHERE r.expert_id = ? ORDER BY r.created_at DESC LIMIT 100',
    [req.params.id]
  );
  const stats = db.get('SELECT avg_rating, review_count FROM experts WHERE id = ?', [req.params.id]);
  res.json({ success: true, reviews: list, avg_rating: stats ? stats.avg_rating : 0, review_count: stats ? stats.review_count : 0 });
});

// 专家回复评价
app.put('/api/reviews/:id/reply', requireAuth, requireExpert, (req, res) => {
  const { reply } = req.body;
  if (!reply) return res.json({ success: false, message: '回复内容不能为空' });
  const review = db.get('SELECT r.*, e.user_id as expert_user_id FROM reviews r JOIN experts e ON e.id = r.expert_id WHERE r.id = ?', [req.params.id]);
  if (!review) return res.json({ success: false, message: '评价不存在' });
  if (review.expert_user_id !== req.expert.user_id) return res.json({ success: false, message: '只能回复自己的评价' });
  db.run("UPDATE reviews SET reply = ?, replied_at = datetime('now') WHERE id = ?", [(reply || '').slice(0, 500), req.params.id]);
  res.json({ success: true });
});

// 专家排名
app.get('/api/experts/ranking', (req, res) => {
  const { sort, order, limit } = req.query;
  const dir = order === 'asc' ? 'ASC' : 'DESC';
  let orderBy = 'e.avg_rating';
  if (sort === 'reviews') orderBy = 'e.review_count';
  else if (sort === 'income') orderBy = '(SELECT total_income FROM expert_wallet WHERE expert_id = e.id)';
  else if (sort === 'consultations') orderBy = '(SELECT COUNT(*) FROM bookings WHERE expert_id = e.id AND status = "completed")';
  const sql = 'SELECT e.id, e.industry, e.title, e.avg_rating, e.review_count, e.views, u.real_name, ' +
    '(SELECT total_income FROM expert_wallet WHERE expert_id = e.id) as total_income, ' +
    '(SELECT COUNT(*) FROM bookings WHERE expert_id = e.id AND status = "completed") as completed_count ' +
    'FROM experts e JOIN users u ON u.id = e.user_id ' +
    'WHERE e.audit_status = "approved" AND e.available = 1 ' +
    'ORDER BY ' + orderBy + ' ' + dir + ' NULLS LAST LIMIT ?';
  const list = db.query(sql, [parseInt(limit) || 20]);
  res.json({ success: true, list });
});
`;

c = c.slice(0, spaIdx) + apis + '\n' + c.slice(spaIdx);
fs.writeFileSync(path, c, 'utf8');
console.log('✅ 已注入评分+排名 API');

// 验证语法
try {
  require('child_process').execSync('node -c "' + path + '"', { stdio: 'pipe' });
  console.log('✅ 语法检查通过');
} catch(e) {
  const out = e.stdout || e.stderr || '';
  console.log('❌ 语法错误:', out.toString().slice(0, 300));
}
