// 给 database.js 加 service_packages 表
const fs = require('fs');
const path = process.argv[2] || './database.js';
let c = fs.readFileSync(path, 'utf8');

const insert = `
  // Service packages table
  db.run(\`CREATE TABLE IF NOT EXISTS service_packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    expert_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    price INTEGER NOT NULL,
    duration INTEGER DEFAULT 60,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (expert_id) REFERENCES experts(id) ON DELETE CASCADE
  )\`);
`;

// 在 platform_config 的 INSERT 之后、Run migrations 之前插入
const anchor = '  // Run migrations for existing databases';
if (!c.includes('service_packages')) {
  c = c.replace(anchor, insert + '\n' + anchor);
  fs.writeFileSync(path, c, 'utf8');
  console.log('✅ 已加 service_packages 表定义');
} else {
  console.log('ℹ️  service_packages 表已存在，跳过');
}
