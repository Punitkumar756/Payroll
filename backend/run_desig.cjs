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
      await connection.query('ALTER TABLE designations ADD COLUMN remark TEXT NULL');
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') throw e;
    }
    try {
      await connection.query('ALTER TABLE designations ADD COLUMN details TEXT NULL');
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') throw e;
    }
    console.log('Columns ready.');

    console.log('Updating create procedure...');
    await connection.query('DROP PROCEDURE IF EXISTS sp_master_designation_create');
    await connection.query(`
      CREATE PROCEDURE sp_master_designation_create(
        IN p_caller_role  VARCHAR(30), IN p_caller_uid INT UNSIGNED,
        IN p_code         VARCHAR(20), IN p_name VARCHAR(100),
        IN p_location_id  INT UNSIGNED, IN p_department_id INT UNSIGNED,
        IN p_remark TEXT, IN p_details TEXT
      )
      BEGIN
        DECLARE v_id INT UNSIGNED;
        IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
        INSERT INTO designations (code, name, location_id, department_id, remark, details)
        VALUES (TRIM(p_code), TRIM(p_name), p_location_id, p_department_id, p_remark, p_details);
        SET v_id = LAST_INSERT_ID();
        CALL sp_audit_log(p_caller_uid, p_caller_role, 'sp_master_designation_create', CAST(v_id AS CHAR), 'CREATE', NULL, JSON_OBJECT('code',p_code,'name',p_name,'location_id',p_location_id,'department_id',p_department_id));
        SELECT v_id AS id;
      END
    `);

    console.log('Updating update procedure...');
    await connection.query('DROP PROCEDURE IF EXISTS sp_master_designation_update');
    await connection.query(`
      CREATE PROCEDURE sp_master_designation_update(
        IN p_caller_role  VARCHAR(30), IN p_caller_uid INT UNSIGNED,
        IN p_id           INT UNSIGNED, IN p_code VARCHAR(20), IN p_name VARCHAR(100),
        IN p_location_id  INT UNSIGNED, IN p_department_id INT UNSIGNED,
        IN p_remark TEXT, IN p_details TEXT,
        IN p_is_active    TINYINT(1)
      )
      BEGIN
        IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
        UPDATE designations
        SET code=TRIM(p_code), name=TRIM(p_name),
            location_id=p_location_id, department_id=p_department_id,
            remark=p_remark, details=p_details,
            is_active=p_is_active
        WHERE id=p_id;
        SELECT ROW_COUNT() AS affected;
      END
    `);

    console.log('Updating list procedure...');
    await connection.query('DROP PROCEDURE IF EXISTS sp_master_designation_list');
    await connection.query(`
      CREATE PROCEDURE sp_master_designation_list(IN p_caller_role VARCHAR(30))
      BEGIN
        SELECT d.id, d.code, d.name,
               d.location_id,   l.name AS location_name,
               d.department_id, dep.name AS department_name,
               d.remark, d.details,
               d.is_active
        FROM designations d
        LEFT JOIN locations   l   ON l.id   = d.location_id
        LEFT JOIN departments dep ON dep.id = d.department_id
        ORDER BY d.name;
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
