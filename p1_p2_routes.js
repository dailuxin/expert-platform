// ===== P1+P2+P3 综合功能路由 =====
const express = require('express');
const router = express.Router();
const { query, get, run, saveToDisk } = require('./database');

// === P1: 搜索分页 ===
router.get('/experts/page-info', (req, res) => {
  const search = req.query.search || '';
  const industry = req.query.industry || '';
  let sql = "SELECT COUNT(*) as total FROM users WHERE role = 'expert' AND status = 'approved'";
  let params = [];
  if (search) { sql += " AND (name LIKE ? OR title LIKE ? OR specialties LIKE ?)"; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  if (industry) { sql += " AND industry = ?"; params.push(industry); }
  const row = get(sql, params);
  res.json({ total: row ? row.total : 0, perPage: 12 });
});

// === P1: 评分分布图数据 ===
router.get('/experts/:id/rating-dist', (req, res) => {
  const rows = query(
    "SELECT rating, COUNT(*) as count FROM reviews WHERE expert_id = ? GROUP BY rating ORDER BY rating DESC",
    [req.params.id]
  );
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  rows.forEach(r => { if (dist[r.rating] !== undefined) dist[r.rating] = r.count; });
  res.json(dist);
});

// === P1: 用户咨询记录 ===
router.get('/my-bookings', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: '未登录' });
  const rows = query(
    `SELECT b.*, e.name as expert_name, e.title as expert_title, e.avatar as expert_avatar 
     FROM bookings b LEFT JOIN users e ON b.expert_id = e.id 
     WHERE b.user_id = ? ORDER BY b.created_at DESC LIMIT 50`,
    [req.session.user.id]
  );
  res.json(rows);
});

// === P2: 智能客服/FAQ ===
router.post('/chatbot/reply', (req, res) => {
  const msg = (req.body.message || '').toLowerCase();
  const rules = [
    { keys: ['价格', '多少钱', '费用', '收费', '收费标准'], reply: '不同专家收费标准不同，请在专家详情页查看具体价格。平台有优惠券可领取，新用户首单立减20元。' },
    { keys: ['退款', '退钱', '取消订单', '取消预约'], reply: '未开始的咨询订单可申请退款，48小时内审核。请在"我的预约"中找到对应订单点击退款。' },
    { keys: ['怎么预约', '如何下单', '如何预约', '预约流程'], reply: '搜索或浏览专家 → 查看详情 → 选择时段 → 确认支付即可完成预约。专家确认后即可开始咨询。' },
    { keys: ['资质', '认证', '真实', '靠谱'], reply: '所有入驻专家均经过平台实名认证和资质审核，认证专家有专属标识，可放心选择。' },
    { keys: ['成为专家', '入驻', '注册专家', '申请专家'], reply: '注册账号后，在个人中心填写专家资料并提交认证。1-3个工作日审核通过即可上线接单。' },
    { keys: ['支付', '付款', '支付方式'], reply: '目前支持在线支付（微信/支付宝等），费用在平台托管，确认完成后结算给专家，资金安全有保障。' },
    { keys: ['投诉', '不满意', '差评'], reply: '如您对服务不满意，可提交评价并联系客服处理。平台会根据情况协调退款或更换专家。' },
    { keys: ['发票', '收据'], reply: '目前暂不支持自动开票，如需发票请联系平台客服（P3功能开发中）。' },
    { keys: ['你好', 'hello', 'hi', '在吗'], reply: '您好！我是专家平台智能客服，有任何问题都可以问我哦～比如：价格、预约流程、退款政策等。' },
    { keys: ['谢谢', '感谢', 'thanks'], reply: '不客气！如果还有其他问题，随时问我。祝您咨询愉快！😊' },
  ];
  for (const rule of rules) {
    if (rule.keys.some(k => msg.includes(k))) {
      return res.json({ success: true, reply: rule.reply });
    }
  }
  res.json({ success: true, reply: '抱歉，我没有理解您的问题。您可以尝试搜索相关专家，或联系人工客服获取帮助。常见问题：价格、预约流程、退款政策。' });
});

// === P2: 公告系统 ===
router.get('/announcements', (req, res) => {
  const rows = query("SELECT * FROM announcements ORDER BY created_at DESC LIMIT 20");
  res.json(rows);
});

router.post('/announcements', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') return res.status(403).json({ error: '无权限' });
  const { title, content } = req.body;
  if (!title || !content) return res.json({ error: '标题和内容不能为空' });
  run("INSERT INTO announcements (title, content, created_at) VALUES (?, ?, datetime('now'))", [title, content]);
  saveToDisk();
  res.json({ success: true });
});

// === P2: 操作日志 ===
router.get('/admin/logs', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') return res.status(403).json({ error: '无权限' });
  const rows = query("SELECT * FROM operation_logs ORDER BY created_at DESC LIMIT 200");
  res.json(rows);
});

// === P2: 数据导出Excel ===
router.get('/admin/export/users', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') return res.status(403).json({ error: '无权限' });
  const rows = query("SELECT id, name, email, role, status, industry, created_at FROM users ORDER BY created_at DESC");
  const ExcelJS = require('exceljs');
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('用户列表');
  sheet.columns = [
    { header: 'ID', key: 'id' }, { header: '姓名', key: 'name' },
    { header: '邮箱', key: 'email' }, { header: '角色', key: 'role' },
    { header: '状态', key: 'status' }, { header: '行业', key: 'industry' },
    { header: '注册时间', key: 'created_at' }
  ];
  rows.forEach(r => sheet.addRow(r));
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');
  workbook.xlsx.write(res).then(() => res.end());
});

router.get('/admin/export/bookings', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') return res.status(403).json({ error: '无权限' });
  const rows = query(
    `SELECT b.id, u1.name as user_name, u2.name as expert_name, b.status, b.total_price, b.created_at 
     FROM bookings b LEFT JOIN users u1 ON b.user_id=u1.id LEFT JOIN users u2 ON b.expert_id=u2.id ORDER BY b.created_at DESC`
  );
  const ExcelJS = require('exceljs');
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('订单列表');
  sheet.columns = [
    { header: 'ID', key: 'id' }, { header: '用户', key: 'user_name' },
    { header: '专家', key: 'expert_name' }, { header: '状态', key: 'status' },
    { header: '金额', key: 'total_price' }, { header: '创建时间', key: 'created_at' }
  ];
  rows.forEach(r => sheet.addRow(r));
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=bookings.xlsx');
  workbook.xlsx.write(res).then(() => res.end());
});

// === P3: 数据库备份 ===
router.post('/admin/backup', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') return res.status(403).json({ error: '无权限' });
  const { export: dbExport } = require('./database');
  // database.js doesn't export `export` directly, use saveToDisk + read file
  saveToDisk();
  const fs = require('fs');
  const path = require('path');
  const backupDir = path.join(__dirname, 'backups');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
  const DB_PATH = process.env.DATA_DIR || process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(__dirname, 'data');
  const srcFile = path.join(DB_PATH, 'expert_platform.db');
  if (!fs.existsSync(srcFile)) return res.json({ error: '数据库文件不存在' });
  const filename = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.db`;
  fs.copyFileSync(srcFile, path.join(backupDir, filename));
  const stat = fs.statSync(path.join(backupDir, filename));
  res.json({ success: true, filename, size: stat.size });
});

router.get('/admin/backups', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') return res.status(403).json({ error: '无权限' });
  const fs = require('fs');
  const path = require('path');
  const backupDir = path.join(__dirname, 'backups');
  if (!fs.existsSync(backupDir)) return res.json([]);
  const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.db')).sort().reverse();
  const list = files.map(f => {
    const stat = fs.statSync(path.join(backupDir, f));
    return { filename: f, size: stat.size, created: stat.mtime };
  });
  res.json(list);
});

module.exports = router;
