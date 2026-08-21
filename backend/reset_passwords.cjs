const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Punit@12',
    database: 'hrms'
  });
  
  try {
    const password = 'Password@123';
    const hash = await bcrypt.hash(password, 12);
    
    await connection.query('UPDATE users SET password_hash = ?', [hash]);
    console.log('All passwords reset to: ' + password);
  } catch (err) {
    console.error(err);
  }
  
  await connection.end();
}

main().catch(console.error);
