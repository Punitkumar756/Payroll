const db = require('mysql2/promise').createPool({ host: 'localhost', user: 'root', password: 'Punit@12', database: 'hrms', multipleStatements: true });
const sql = `
DROP PROCEDURE IF EXISTS sp_user_create_standalone;
CREATE PROCEDURE sp_user_create_standalone(
  IN p_caller_role  VARCHAR(30),
  IN p_caller_uid   INT UNSIGNED,
  IN p_username     VARCHAR(100),
  IN p_password_hash VARCHAR(255),
  IN p_role_id      TINYINT UNSIGNED
)
BEGIN
  DECLARE v_id INT UNSIGNED;
  IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
  
  INSERT INTO users (employee_id, username, password_hash, role_id)
  VALUES (NULL, p_username, p_password_hash, p_role_id);
  
  SET v_id=LAST_INSERT_ID();
  CALL sp_audit_log(p_caller_uid, p_caller_role, 'sp_user_create_standalone', CAST(v_id AS CHAR), 'CREATE', NULL, JSON_OBJECT('username',p_username,'role_id',p_role_id));
  
  SELECT v_id AS id;
END;
`;
db.query(sql).then(() => { console.log('SP created'); process.exit(0); }).catch(e => { console.log(e); process.exit(1); });
