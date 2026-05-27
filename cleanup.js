const Database = require('better-sqlite3');
const db = new Database('C:\Users\dailu\Desktop\expert-platform\database.sqlite');
db.exec("DELETE FROM bookings; DELETE FROM payments; DELETE FROM refunds; DELETE FROM experts WHERE id > 0; DELETE FROM users WHERE username IN ('testflow','test001','expert001','user001');");
console.log('Cleaned');
db.close();
