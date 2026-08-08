import mysql from 'mysql2/promise';

async function run() {
  const pool = mysql.createPool({
    host: 'localhost', user: 'root', password: 'Punit@12', database: 'hrms', multipleStatements: true
  });

  const sql = `
    DROP PROCEDURE IF EXISTS sp_employee_get_by_id;
    CREATE PROCEDURE sp_employee_get_by_id(
      IN p_caller_role        VARCHAR(30),
      IN p_caller_employee_id INT UNSIGNED,
      IN p_target_employee_id INT UNSIGNED
    )
    BEGIN
      IF p_caller_role = 'Employee' AND p_caller_employee_id != p_target_employee_id THEN
        SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:own_record_only';
      END IF;
      SELECT
        e.id, e.employee_code, e.first_name, e.middle_name, e.last_name,
        e.date_of_birth, e.gender, e.joining_date, e.confirmation_date,
        e.status, e.official_email, e.personal_email, e.contact_number, e.badge_id,
        e.photo_path,
        e.department_id, e.designation_id, e.location_id, e.category_id,
        e.group_id, e.sub_group_id, e.calendar_id, e.reporting_manager_id,
        d.name AS department_name, des.name AS designation_name,
        l.name AS location_name, c.name AS category_name,
        g.name AS group_name, sg.name AS sub_group_name,
        cal.name AS calendar_name,
        CONCAT(m.first_name,' ',m.last_name) AS reporting_manager_name,
        sd.pf_number, sd.esi_number, sd.uan_number,
        IF(p_caller_role='HR', sd.bank_name, sd.bank_name) AS bank_name,
        IF(p_caller_role='HR', sd.bank_ifsc, sd.bank_ifsc) AS bank_ifsc
      FROM employees e
      LEFT JOIN departments d   ON d.id=e.department_id
      LEFT JOIN designations des ON des.id=e.designation_id
      LEFT JOIN locations l     ON l.id=e.location_id
      LEFT JOIN categories c    ON c.id=e.category_id
      LEFT JOIN \`groups\` g      ON g.id=e.group_id
      LEFT JOIN sub_groups sg   ON sg.id=e.sub_group_id
      LEFT JOIN calendars cal   ON cal.id=e.calendar_id
      LEFT JOIN employees m     ON m.id=e.reporting_manager_id
      LEFT JOIN employee_statutory_details sd ON sd.employee_id=e.id
      WHERE e.id=p_target_employee_id;
    END;

    DROP PROCEDURE IF EXISTS sp_employee_update_status;
    CREATE PROCEDURE sp_employee_update_status(
      IN p_caller_role VARCHAR(30),
      IN p_caller_uid INT UNSIGNED,
      IN p_employee_id INT UNSIGNED,
      IN p_status ENUM('Active','Inactive','Resigned','Terminated')
    )
    BEGIN
      IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
      
      UPDATE employees
      SET status = p_status, updated_at = NOW()
      WHERE id = p_employee_id;
      
      CALL sp_audit_log(p_caller_uid, p_caller_role, 'sp_employee_update_status', CAST(p_employee_id AS CHAR), 'UPDATE', NULL, JSON_OBJECT('new_status', p_status));
      
      SELECT p_employee_id AS id, p_status AS status;
    END;
  `;

  try {
    await pool.query(sql);
    console.log("Database schema and procedures updated successfully.");
  } catch (err) {
    console.error('Error:', err);
  } finally {
    pool.end();
  }
}
run();
