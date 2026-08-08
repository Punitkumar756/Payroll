const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hrms',
  });

  const hash = '$2a$12$2puxPBS7Lh1x6hWuHaK0NuEuqRvfN793LL2TDmTjeqamCSl.oYJNO';
  await connection.execute('UPDATE users SET password_hash = ? WHERE username = ?', [hash, 'admin']);
  console.log('Password hash updated for admin user.');
  
  await connection.end();
}

main().catch(console.error);
