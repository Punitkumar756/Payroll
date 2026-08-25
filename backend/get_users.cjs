const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Punit@12',
    database: 'hrms'
  });
  
  try {
    const [users] = await connection.query(`
      SELECT * FROM users
    `);
    console.log(users);
  } catch (err) {
    console.error(err);
  }
  
  await connection.end();
}

main().catch(console.error);
