const mysql = require('mysql2/promise');
require('dotenv').config();

async function fix() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    database: process.env.DB_NAME || "hrms",
    user: process.env.DB_USER || "hrms_app",
    password: process.env.DB_PASSWORD || "",
  });

  const sql = `
CREATE PROCEDURE sp_announcement_update(
  IN p_caller_role VARCHAR(30),
  IN p_caller_uid INT UNSIGNED,
  IN p_id INT UNSIGNED,
  IN p_heading VARCHAR(300),
  IN p_type VARCHAR(50),
  IN p_display_start DATE,
  IN p_display_end DATE,
  IN p_content TEXT
)
BEGIN
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  IF p_display_end < p_display_start THEN SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'VALIDATION:end_before_start'; END IF;
  
  UPDATE announcements 
  SET heading = p_heading, type = p_type, display_start = p_display_start, display_end = p_display_end, content = p_content
  WHERE id = p_id;
  
  SELECT ROW_COUNT() AS updated;
END`;

  await pool.query('DROP PROCEDURE IF EXISTS sp_announcement_update');
  await pool.query(sql);
  console.log('SP Created');
  process.exit(0);
}
fix();
