const mysql = require('mysql2/promise');

async function run() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Punit@12',
    database: 'hrms'
  });

  try {
    await connection.query('ALTER TABLE `locations` ADD COLUMN `remark` TEXT DEFAULT NULL, ADD COLUMN `details` TEXT DEFAULT NULL');
    console.log('Altered table');
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') {
      console.log('Columns already exist');
    } else {
      console.error(e);
    }
  }

  const p1 = `
CREATE PROCEDURE \`sp_master_location_create\`(
  IN p_caller_role  VARCHAR(30),
  IN p_caller_uid   INT UNSIGNED,
  IN p_code         VARCHAR(20),
  IN p_name         VARCHAR(100),
  IN p_address      TEXT,
  IN p_phone        VARCHAR(20),
  IN p_fax          VARCHAR(20),
  IN p_website      VARCHAR(200),
  IN p_remark       TEXT,
  IN p_details      TEXT
)
BEGIN
  DECLARE v_id INT UNSIGNED;
  IF p_caller_role != 'HR' THEN
    SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY';
  END IF;
  IF p_code IS NULL OR TRIM(p_code) = '' THEN
    SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'VALIDATION:code_required';
  END IF;
  IF p_name IS NULL OR TRIM(p_name) = '' THEN
    SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'VALIDATION:name_required';
  END IF;
  INSERT INTO locations (code, name, address, phone, fax, website, remark, details)
  VALUES (TRIM(p_code), TRIM(p_name), p_address, p_phone, p_fax, p_website, p_remark, p_details);
  SET v_id = LAST_INSERT_ID();
  CALL sp_audit_log(p_caller_uid, p_caller_role, 'sp_master_location_create', CAST(v_id AS CHAR), 'CREATE', NULL, JSON_OBJECT('code', p_code, 'name', p_name));
  SELECT v_id AS id;
END`;

  const p2 = `
CREATE PROCEDURE \`sp_master_location_update\`(
  IN p_caller_role  VARCHAR(30),
  IN p_caller_uid   INT UNSIGNED,
  IN p_id           INT UNSIGNED,
  IN p_code         VARCHAR(20),
  IN p_name         VARCHAR(100),
  IN p_address      TEXT,
  IN p_phone        VARCHAR(20),
  IN p_fax          VARCHAR(20),
  IN p_website      VARCHAR(200),
  IN p_remark       TEXT,
  IN p_details      TEXT,
  IN p_is_active    TINYINT(1)
)
BEGIN
  IF p_caller_role != 'HR' THEN
    SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM locations WHERE id = p_id) THEN
    SIGNAL SQLSTATE '45004' SET MESSAGE_TEXT = 'NOT_FOUND:location';
  END IF;
  UPDATE locations SET code=TRIM(p_code), name=TRIM(p_name), address=p_address,
    phone=p_phone, fax=p_fax, website=p_website, remark=p_remark, details=p_details, is_active=p_is_active
  WHERE id = p_id;
  CALL sp_audit_log(p_caller_uid, p_caller_role, 'sp_master_location_update', CAST(p_id AS CHAR), 'UPDATE', NULL, JSON_OBJECT('code', p_code, 'name', p_name));
  SELECT ROW_COUNT() AS affected;
END`;

  const p3 = `
CREATE PROCEDURE \`sp_master_location_list\`(
  IN p_caller_role VARCHAR(30)
)
BEGIN
  IF p_caller_role NOT IN ('HR', 'Manager', 'Employee') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ACCESS_DENIED';
  END IF;
  SELECT id, code, name, address, phone, fax, website, remark, details, is_active, created_at
  FROM locations
  ORDER BY name;
END`;

  try {
    await connection.query('DROP PROCEDURE IF EXISTS `sp_master_location_create`');
    await connection.query(p1);
    console.log('Updated create');

    await connection.query('DROP PROCEDURE IF EXISTS `sp_master_location_update`');
    await connection.query(p2);
    console.log('Updated update');

    await connection.query('DROP PROCEDURE IF EXISTS `sp_master_location_list`');
    await connection.query(p3);
    console.log('Updated list');

  } catch (e) {
    console.error(e);
  }

  await connection.end();
}

run().catch(console.error);
