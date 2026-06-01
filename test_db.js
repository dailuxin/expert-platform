const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const os = require('os');

const DATA_DIR = path.join(os.tmpdir(), 'expert-platform-data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
console.log('数据目录:', DATA_DIR);

initSqlJs().then(SQL => {
  const db = new SQL.Database();
  db.run('CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY)');
  console.log('数据库初始化成功');
  db.close();
}).catch(err => {
  console.error('数据库初始化失败:', err.message);
});
