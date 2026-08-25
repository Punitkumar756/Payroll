const mysql = require('mysql2/promise');

async function run() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Punit@12',
    database: 'hrms',
    multipleStatements: true
  });

  try {
    console.log('Adding columns...');
    try {
      await connection.query('ALTER TABLE departments ADD COLUMN remark TEXT NULL');
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') throw e;
    }
    try {
      await connection.query('ALTER TABLE departments ADD COLUMN details TEXT NULL');
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') throw e;
    }
    console.log('Columns ready.');

    console.log('Updating create procedure...');
    await connection.query('DROP PROCEDURE IF EXISTS sp_master_department_create');
    await connection.query(`
      CREATE PROCEDURE sp_master_department_create(
        IN p_caller_role VARCHAR(30), IN p_caller_uid INT UNSIGNED,
        IN p_code VARCHAR(20), IN p_name VARCHAR(100),
        IN p_remark TEXT, IN p_details TEXT
      )
      BEGIN
        DECLARE v_id INT UNSIGNED;
        IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
        IF p_code IS NULL OR TRIM(p_code)='' THEN SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'VALIDATION:code_required'; END IF;
        INSERT INTO departments (code, name, remark, details) VALUES (TRIM(p_code), TRIM(p_name), p_remark, p_details);
        SET v_id = LAST_INSERT_ID();
        CALL sp_audit_log(p_caller_uid, p_caller_role, 'sp_master_department_create', CAST(v_id AS CHAR), 'CREATE', NULL, JSON_OBJECT('code',p_code,'name',p_name));
        SELECT v_id AS id;
      END
    `);

    console.log('Updating update procedure...');
    await connection.query('DROP PROCEDURE IF EXISTS sp_master_department_update');
    await connection.query(`
      CREATE PROCEDURE sp_master_department_update(
        IN p_caller_role VARCHAR(30), IN p_caller_uid INT UNSIGNED,
        IN p_id INT UNSIGNED, IN p_code VARCHAR(20), IN p_name VARCHAR(100),
        IN p_remark TEXT, IN p_details TEXT, IN p_is_active TINYINT(1)
      )
      BEGIN
        IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
        IF NOT EXISTS (SELECT 1 FROM departments WHERE id=p_id) THEN SIGNAL SQLSTATE '45004' SET MESSAGE_TEXT = 'NOT_FOUND:department'; END IF;
        UPDATE departments SET code=TRIM(p_code), name=TRIM(p_name), remark=p_remark, details=p_details, is_active=p_is_active WHERE id=p_id;
        CALL sp_audit_log(p_caller_uid, p_caller_role, 'sp_master_department_update', CAST(p_id AS CHAR), 'UPDATE', NULL, JSON_OBJECT('code',p_code,'name',p_name));
        SELECT ROW_COUNT() AS affected;
      END
    `);

    console.log('Updating list procedure...');
    await connection.query('DROP PROCEDURE IF EXISTS sp_master_department_list');
    await connection.query(`
      CREATE PROCEDURE sp_master_department_list(IN p_caller_role VARCHAR(30))
      BEGIN
        IF p_caller_role NOT IN ('HR','Manager','Employee') THEN
          SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ACCESS_DENIED';
        END IF;
        SELECT id, code, name, remark, details, is_active, created_at FROM departments ORDER BY name;
      END
    `);

    console.log('Success!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await connection.end();
  }
}

run();
