import pool from './src/db/pool.js';

async function createTable() {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        description TEXT NOT NULL,
        status ENUM('Pending', 'In Progress', 'Completed') DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    await pool.query(query);
    console.log('Tasks table created successfully');
  } catch (error) {
    console.error('Error creating Tasks table:', error);
  } finally {
    pool.end();
  }
}

createTable();
