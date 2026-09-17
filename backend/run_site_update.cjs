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
    console.log('Creating sites table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sites (
        id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        code VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        lat DECIMAL(10, 8),
        lng DECIMAL(11, 8),
        radius INT UNSIGNED,
        remark TEXT,
        details TEXT,
        is_active TINYINT(1) DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log('Adding site_id to employees table...');
    try { 
      await connection.query(`ALTER TABLE employees ADD COLUMN site_id INT UNSIGNED NULL`);
      await connection.query(`ALTER TABLE employees ADD CONSTRAINT fk_employee_site FOREIGN KEY (site_id) REFERENCES sites(id)`);
    } catch(e) {
      console.log('Column site_id may already exist or foreign key failed (ignoring)', e.message);
    }

    console.log('Updating Sites SPs...');
    await connection.query('DROP PROCEDURE IF EXISTS sp_master_site_create');
    await connection.query(`
      CREATE PROCEDURE sp_master_site_create(
        IN p_caller_role VARCHAR(30), 
        IN p_caller_uid INT UNSIGNED, 
        IN p_code VARCHAR(20), 
        IN p_name VARCHAR(100), 
        IN p_lat DECIMAL(10, 8),
        IN p_lng DECIMAL(11, 8),
        IN p_radius INT UNSIGNED,
        IN p_remark TEXT, 
        IN p_details TEXT
      )
      BEGIN
        DECLARE v_id INT UNSIGNED;
        IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
        INSERT INTO sites (code, name, lat, lng, radius, remark, details) 
        VALUES (TRIM(p_code), TRIM(p_name), p_lat, p_lng, p_radius, p_remark, p_details);
        SET v_id = LAST_INSERT_ID();
        SELECT v_id AS id;
      END
    `);

    await connection.query('DROP PROCEDURE IF EXISTS sp_master_site_update');
    await connection.query(`
      CREATE PROCEDURE sp_master_site_update(
        IN p_caller_role VARCHAR(30), 
        IN p_caller_uid INT UNSIGNED, 
        IN p_id INT UNSIGNED, 
        IN p_code VARCHAR(20), 
        IN p_name VARCHAR(100), 
        IN p_lat DECIMAL(10, 8),
        IN p_lng DECIMAL(11, 8),
        IN p_radius INT UNSIGNED,
        IN p_remark TEXT, 
        IN p_details TEXT, 
        IN p_is_active TINYINT(1)
      )
      BEGIN
        IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
        UPDATE sites 
        SET code = TRIM(p_code), 
            name = TRIM(p_name), 
            lat = p_lat, 
            lng = p_lng, 
            radius = p_radius, 
            remark = p_remark, 
            details = p_details, 
            is_active = p_is_active 
        WHERE id = p_id;
        SELECT ROW_COUNT() AS affected;
      END
    `);

    await connection.query('DROP PROCEDURE IF EXISTS sp_master_site_list');
    await connection.query(`
      CREATE PROCEDURE sp_master_site_list(IN p_caller_role VARCHAR(30))
      BEGIN
        SELECT id, code, name, lat, lng, radius, remark, details, is_active 
        FROM sites 
        ORDER BY name;
      END
    `);

    console.log('Updating Employee Create SP to include site_id...');
    await connection.query('DROP PROCEDURE IF EXISTS sp_employee_create');
    await connection.query(`
      CREATE PROCEDURE sp_employee_create(
        IN p_caller_role     VARCHAR(30),
        IN p_caller_uid      INT UNSIGNED,
        IN p_employee_code   VARCHAR(30),
        IN p_first_name      VARCHAR(80),
        IN p_middle_name     VARCHAR(80),
        IN p_last_name       VARCHAR(80),
        IN p_dob             DATE,
        IN p_gender          VARCHAR(10),
        IN p_joining_date    DATE,
        IN p_department_id   INT UNSIGNED,
        IN p_designation_id  INT UNSIGNED,
        IN p_location_id     INT UNSIGNED,
        IN p_category_id     INT UNSIGNED,
        IN p_group_id        INT UNSIGNED,
        IN p_sub_group_id    INT UNSIGNED,
        IN p_calendar_id     INT UNSIGNED,
        IN p_reporting_mgr   INT UNSIGNED,
        IN p_official_email  VARCHAR(200),
        IN p_contact_number  VARCHAR(20),
        IN p_badge_id        VARCHAR(50),
        IN p_site_id         INT UNSIGNED
      )
      BEGIN
        DECLARE v_id INT UNSIGNED;
        IF p_caller_role != 'HR' THEN
          SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY';
        END IF;
        IF p_first_name IS NULL OR TRIM(p_first_name)='' THEN
          SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'VALIDATION:first_name_required';
        END IF;
        IF p_last_name IS NULL OR TRIM(p_last_name)='' THEN
          SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'VALIDATION:last_name_required';
        END IF;
        IF p_joining_date IS NULL THEN
          SIGNAL SQLSTATE '45001' SET MESSAGE_TEXT = 'VALIDATION:joining_date_required';
        END IF;
        START TRANSACTION;
          INSERT INTO employees (
            employee_code, first_name, middle_name, last_name, date_of_birth, gender,
            joining_date, department_id, designation_id, location_id, category_id,
            group_id, sub_group_id, calendar_id, reporting_manager_id,
            official_email, contact_number, badge_id, site_id
          ) VALUES (
            TRIM(p_employee_code), TRIM(p_first_name), p_middle_name, TRIM(p_last_name),
            p_dob, p_gender, p_joining_date, p_department_id, p_designation_id,
            p_location_id, p_category_id, p_group_id, p_sub_group_id, p_calendar_id,
            p_reporting_mgr, p_official_email, p_contact_number, p_badge_id, p_site_id
          );
          SET v_id = LAST_INSERT_ID();
          INSERT INTO employee_statutory_details (employee_id) VALUES (v_id);
          CALL sp_audit_log(p_caller_uid, p_caller_role, 'sp_employee_create', CAST(v_id AS CHAR), 'CREATE', NULL,
            JSON_OBJECT('code',p_employee_code,'name',CONCAT(p_first_name,' ',p_last_name)));
        COMMIT;
        SELECT v_id AS id;
      END
    `);

    console.log('Updating Employee Update SP to include site_id...');
    await connection.query('DROP PROCEDURE IF EXISTS sp_employee_update');
    await connection.query(`
      CREATE PROCEDURE sp_employee_update(
        IN p_caller_role     VARCHAR(30),
        IN p_caller_uid      INT UNSIGNED,
        IN p_id              INT UNSIGNED,
        IN p_first_name      VARCHAR(80),
        IN p_middle_name     VARCHAR(80),
        IN p_last_name       VARCHAR(80),
        IN p_dob             DATE,
        IN p_gender          VARCHAR(10),
        IN p_joining_date    DATE,
        IN p_confirmation_date DATE,
        IN p_status          VARCHAR(20),
        IN p_department_id   INT UNSIGNED,
        IN p_designation_id  INT UNSIGNED,
        IN p_location_id     INT UNSIGNED,
        IN p_category_id     INT UNSIGNED,
        IN p_group_id        INT UNSIGNED,
        IN p_sub_group_id    INT UNSIGNED,
        IN p_calendar_id     INT UNSIGNED,
        IN p_reporting_mgr   INT UNSIGNED,
        IN p_official_email  VARCHAR(200),
        IN p_contact_number  VARCHAR(20),
        IN p_badge_id        VARCHAR(50),
        IN p_site_id         INT UNSIGNED
      )
      BEGIN
        IF p_caller_role != 'HR' THEN
          SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM employees WHERE id=p_id) THEN
          SIGNAL SQLSTATE '45004' SET MESSAGE_TEXT = 'NOT_FOUND:employee';
        END IF;
        UPDATE employees SET
          first_name=TRIM(p_first_name), middle_name=p_middle_name, last_name=TRIM(p_last_name),
          date_of_birth=p_dob, gender=p_gender, joining_date=p_joining_date,
          confirmation_date=p_confirmation_date, status=p_status,
          department_id=p_department_id, designation_id=p_designation_id,
          location_id=p_location_id, category_id=p_category_id,
          group_id=p_group_id, sub_group_id=p_sub_group_id,
          calendar_id=p_calendar_id, reporting_manager_id=p_reporting_mgr,
          official_email=p_official_email, contact_number=p_contact_number, badge_id=p_badge_id, site_id=p_site_id
        WHERE id=p_id;
        CALL sp_audit_log(p_caller_uid, p_caller_role, 'sp_employee_update', CAST(p_id AS CHAR), 'UPDATE', NULL, NULL);
        SELECT ROW_COUNT() AS affected;
      END
    `);

    console.log('Updating Employee Get By Id SP to include site_id...');
    await connection.query('DROP PROCEDURE IF EXISTS sp_employee_get_by_id');
    await connection.query(`
      CREATE PROCEDURE sp_employee_get_by_id(
        IN p_caller_role        VARCHAR(30),
        IN p_caller_employee_id INT UNSIGNED,
        IN p_target_employee_id INT UNSIGNED,
        IN p_enc_key            VARCHAR(100)
      )
      BEGIN
        IF p_caller_role IN ('Employee', 'Manager') AND p_caller_employee_id != p_target_employee_id THEN
          SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:own_record_only';
        END IF;
        SELECT
          e.id, e.employee_code, e.first_name, e.middle_name, e.last_name,
          e.date_of_birth, e.gender, e.joining_date, e.confirmation_date,
          e.status, e.official_email, e.personal_email, e.contact_number, e.badge_id,
          e.photo_path,
          e.department_id, e.designation_id, e.location_id, e.category_id,
          e.group_id, e.sub_group_id, e.calendar_id, e.reporting_manager_id, e.site_id,
          d.name   AS department_name,
          des.name AS designation_name,
          l.name   AS location_name,
          c.name   AS category_name,
          g.name   AS group_name,
          sg.name  AS sub_group_name,
          cal.calendar_name AS calendar_name,
          CONCAT(m.first_name,' ',m.last_name) AS reporting_manager_name,
          s.name   AS site_name,
          sd.pf_number, sd.esi_number, sd.uan_number,
          sd.bank_name, sd.bank_ifsc, sd.bank_branch,
          IF(p_caller_role='HR', CAST(AES_DECRYPT(sd.pan_encrypted,          p_enc_key) AS CHAR), NULL) AS pan,
          IF(p_caller_role='HR', CAST(AES_DECRYPT(sd.aadhaar_encrypted,      p_enc_key) AS CHAR), NULL) AS aadhaar,
          IF(p_caller_role='HR', CAST(AES_DECRYPT(sd.bank_account_encrypted, p_enc_key) AS CHAR), NULL) AS bank_account
        FROM employees e
        LEFT JOIN departments d    ON d.id=e.department_id
        LEFT JOIN designations des ON des.id=e.designation_id
        LEFT JOIN locations l      ON l.id=e.location_id
        LEFT JOIN categories c     ON c.id=e.category_id
        LEFT JOIN \`groups\` g       ON g.id=e.group_id
        LEFT JOIN sub_groups sg    ON sg.id=e.sub_group_id
        LEFT JOIN calendars cal    ON cal.id=e.calendar_id
        LEFT JOIN employees m      ON m.id=e.reporting_manager_id
        LEFT JOIN sites s          ON s.id=e.site_id
        LEFT JOIN employee_statutory_details sd ON sd.employee_id=e.id
        WHERE e.id=p_target_employee_id;
      END
    `);

    console.log('Updating Employee List SP to include site_id...');
    await connection.query('DROP PROCEDURE IF EXISTS sp_employee_list');
    await connection.query(`
      CREATE PROCEDURE sp_employee_list(
        IN p_caller_role    VARCHAR(30),
        IN p_department_id  INT UNSIGNED,
        IN p_location_id    INT UNSIGNED,
        IN p_status         VARCHAR(20),
        IN p_search         VARCHAR(100),
        IN p_page           INT UNSIGNED,
        IN p_page_size      INT UNSIGNED
      )
      BEGIN
        DECLARE v_offset INT UNSIGNED;
        IF p_caller_role != 'HR' THEN
          SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY';
        END IF;
        SET p_page = IFNULL(p_page, 1);
        SET p_page_size = IFNULL(p_page_size, 20);
        SET v_offset = (p_page - 1) * p_page_size;
        SELECT
          e.id, e.employee_code, CONCAT(e.first_name,' ',e.last_name) AS full_name,
          e.official_email, e.contact_number, e.joining_date, e.status,
          d.name AS department, des.name AS designation, l.name AS location, s.name AS site
        FROM employees e
        LEFT JOIN departments d    ON d.id=e.department_id
        LEFT JOIN designations des ON des.id=e.designation_id
        LEFT JOIN locations l      ON l.id=e.location_id
        LEFT JOIN sites s          ON s.id=e.site_id
        WHERE (p_department_id IS NULL OR e.department_id=p_department_id)
          AND (p_location_id IS NULL   OR e.location_id=p_location_id)
          AND (p_status IS NULL        OR e.status=p_status)
          AND (p_search IS NULL        OR CONCAT(e.first_name,' ',e.last_name) LIKE CONCAT('%',p_search,'%')
               OR e.employee_code LIKE CONCAT('%',p_search,'%'))
        ORDER BY e.first_name, e.last_name
        LIMIT p_page_size OFFSET v_offset;
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
