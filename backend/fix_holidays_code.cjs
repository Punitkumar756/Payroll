const mysql = require('mysql2/promise');

async function run() {
  const connection = await mysql.createConnection({
    host: 'localhost', user: 'root', password: 'Punit@12', database: 'hrms', multipleStatements: true
  });

  try {
    await connection.query('ALTER TABLE calendar_holidays ADD COLUMN holiday_code VARCHAR(50) DEFAULT NULL AFTER calendar_id;');
    console.log("Added column holiday_code");
  } catch (e) {
    if (e.code !== 'ER_DUP_FIELDNAME') {
      console.error(e);
    } else {
      console.log("holiday_code column already exists.");
    }
  }

  const spCreate = `
CREATE PROCEDURE \`sp_master_holiday_create\`(
  IN p_caller_role VARCHAR(30), IN p_caller_uid INT UNSIGNED,
  IN p_code VARCHAR(20), IN p_name VARCHAR(200),
  IN p_start_date DATE, IN p_end_date DATE,
  IN p_is_week_off TINYINT(1), IN p_is_optional TINYINT(1),
  IN p_calendar_ids JSON
)
BEGIN
  DECLARE v_id INT UNSIGNED DEFAULT 0;
  DECLARE v_cal_id INT UNSIGNED;
  DECLARE v_idx INT DEFAULT 0;
  DECLARE v_len INT;
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  IF p_end_date < p_start_date THEN SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'VALIDATION:end_before_start'; END IF;
  
  IF p_calendar_ids IS NOT NULL THEN
    SET v_len = JSON_LENGTH(p_calendar_ids);
    WHILE v_idx < v_len DO
      SET v_cal_id = JSON_EXTRACT(p_calendar_ids, CONCAT('$[',v_idx,']'));
      INSERT IGNORE INTO calendar_holidays (calendar_id, holiday_code, holiday_date, holiday_name, is_optional) 
      VALUES (v_cal_id, p_code, p_start_date, TRIM(p_name), p_is_optional);
      SET v_id = LAST_INSERT_ID();
      SET v_idx = v_idx+1;
    END WHILE;
  END IF;
  CALL sp_audit_log(p_caller_uid, p_caller_role, 'sp_master_holiday_create', CAST(v_id AS CHAR), 'CREATE', NULL, JSON_OBJECT('code',p_code,'name',p_name));
  SELECT v_id AS id;
END
  `;
  await connection.query('DROP PROCEDURE IF EXISTS sp_master_holiday_create');
  await connection.query(spCreate);

  const spList = `
CREATE PROCEDURE \`sp_master_holiday_list\`(IN p_caller_role VARCHAR(30), IN p_calendar_id INT UNSIGNED)
BEGIN
  SELECT h.id, 
         IFNULL(h.holiday_code, '') AS code, 
         h.holiday_name AS name, 
         h.holiday_date AS start_date, 
         h.holiday_date AS end_date, 
         0 AS is_week_off, 
         h.is_optional,
         CAST(h.calendar_id AS CHAR) AS calendar_ids
  FROM calendar_holidays h
  WHERE (p_calendar_id IS NULL OR h.calendar_id=p_calendar_id)
  ORDER BY h.holiday_date;
END
  `;
  await connection.query('DROP PROCEDURE IF EXISTS sp_master_holiday_list');
  await connection.query(spList);

  console.log("Migration complete.");
  process.exit(0);
}
run();
