const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const hash = '$2a$12$2puxPBS7Lh1x6hWuHaK0NuEuqRvfN793LL2TDmTjeqamCSl.oYJNO';
  await connection.execute('UPDATE users SET password_hash = ? WHERE username = ?', [hash, 'admin']);
  console.log('Password hash updated for admin user.');
  
  await connection.end();
}

main().catch(console.error);
