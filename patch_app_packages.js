// 给 app.js 加服务套餐 CRUD 接口（插入到 SPA 路由之前）
const fs = require('fs');
const path = process.argv[2] || './app.js';
let c = fs.readFileSync(path, 'utf8');

// 找 SPA 路由（catch-all）的位置
const spaIdx = c.lastIndexOf("app.get('*'");
if (spaIdx === -1) {
  console.log('未找到 SPA 路由，无法插入接口');
  process.exit(1);
}
console.log('SPA 路由位置:', spaIdx);

const apis = `
// ===== Service Packages API =====

// 专家查看自己的服务套餐
app.get('/api/expert/packages', requireAuth, requireExpertApproved, (req, res) => {
  const list = db.query(
    'SELECT * FROM service_packages WHERE expert_id = ? AND is_active = 1',
    [req.expert.id]
  );
  res.json(list);
});

// 专家创建服务套餐
app.post('/api/expert/packages', requireAuth, requireExpertApproved, (req, res) => {
  const { name, description, price, duration } = req.body;
  if (!name || !price) return res.json({ success: false, message: '名称和价格为必填项' });
  const r = db.run(
    'INSERT INTO service_packages (expert_id, name, description, price, duration) VALUES (?, ?, ?, ?, ?)',
    [req.expert.id, name, description || '', parseInt(price) || 0, parseInt(duration) || 60]
  );
  res.json({ success: true, id: r.lastInsertRowId });
});

// 专家更新服务套餐
app.put('/api/expert/packages/:id', requireAuth, requireExpertApproved, (req, res) => {
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
app.delete('/api/expert/packages/:id', requireAuth, requireExpertApproved, (req, res) => {
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
`;

// 插入到 SPA 路由之前
c = c.slice(0, spaIdx) + apis + '\n' + c.slice(spaIdx);
fs.writeFileSync(path, c, 'utf8');
console.log('✅ 已加服务套餐 CRUD 接口（插入位置:', spaIdx, ')');

// 验证语法
try {
  require('child_process').execSync('node -c "' + path + '"', { stdio: 'pipe' });
  console.log('✅ 语法检查通过');
} catch(e) {
  console.log('❌ 语法错误:', e.stdout || e.stderr);
}
