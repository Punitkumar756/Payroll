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
    console.log('Adding photo and location columns to attendance_daily...');
    try { 
      await connection.query(`ALTER TABLE attendance_daily ADD COLUMN check_in_photo VARCHAR(255) NULL`);
      await connection.query(`ALTER TABLE attendance_daily ADD COLUMN check_in_lat DECIMAL(10, 8) NULL`);
      await connection.query(`ALTER TABLE attendance_daily ADD COLUMN check_in_lng DECIMAL(11, 8) NULL`);
      await connection.query(`ALTER TABLE attendance_daily ADD COLUMN check_out_photo VARCHAR(255) NULL`);
      await connection.query(`ALTER TABLE attendance_daily ADD COLUMN check_out_lat DECIMAL(10, 8) NULL`);
      await connection.query(`ALTER TABLE attendance_daily ADD COLUMN check_out_lng DECIMAL(11, 8) NULL`);
    } catch(e) {
      console.log('Columns may already exist (ignoring)');
    }

    console.log('Creating sp_employee_get_site_geofence...');
    await connection.query('DROP PROCEDURE IF EXISTS sp_employee_get_site_geofence');
    await connection.query(`
      CREATE PROCEDURE sp_employee_get_site_geofence(IN p_employee_id INT UNSIGNED)
      BEGIN
        SELECT s.id, s.lat, s.lng, s.radius
        FROM employees e
        LEFT JOIN sites s ON e.site_id = s.id
        WHERE e.id = p_employee_id;
      END
    `);

    console.log('Creating sp_attendance_self_punch...');
    await connection.query('DROP PROCEDURE IF EXISTS sp_attendance_self_punch');
    await connection.query(`
      CREATE PROCEDURE sp_attendance_self_punch(
        IN p_employee_id INT UNSIGNED,
        IN p_type VARCHAR(20),
        IN p_photo_path VARCHAR(255),
        IN p_lat DECIMAL(10, 8),
        IN p_lng DECIMAL(11, 8)
      )
      BEGIN
        DECLARE v_att_date DATE;
        DECLARE v_now DATETIME;
        DECLARE v_shift_id INT UNSIGNED;
        
        SET v_att_date = CURDATE();
        SET v_now = NOW();

        -- Get the effective shift for this date
        SELECT shift_id INTO v_shift_id
        FROM employee_shift_assignments
        WHERE employee_id = p_employee_id
          AND effective_from <= v_att_date
          AND (effective_to IS NULL OR effective_to >= v_att_date)
        ORDER BY effective_from DESC LIMIT 1;

        IF EXISTS (SELECT 1 FROM attendance_daily WHERE employee_id=p_employee_id AND attendance_date=v_att_date AND is_locked=1) THEN
          SIGNAL SQLSTATE '45002' SET MESSAGE_TEXT = 'CONFLICT:period_locked';
        END IF;

        IF p_type = 'CHECK_IN' THEN
          INSERT INTO attendance_daily (
            employee_id, attendance_date, day_status, check_in, 
            check_in_photo, check_in_lat, check_in_lng, is_manual, shift_id
          )
          VALUES (
            p_employee_id, v_att_date, 'Present', v_now,
            p_photo_path, p_lat, p_lng, 0, v_shift_id
          )
          ON DUPLICATE KEY UPDATE
            check_in = v_now,
            check_in_photo = p_photo_path,
            check_in_lat = p_lat,
            check_in_lng = p_lng,
            day_status = 'Present',
            shift_id = COALESCE(shift_id, v_shift_id);
        ELSEIF p_type = 'CHECK_OUT' THEN
          UPDATE attendance_daily SET
            check_out = v_now,
            check_out_photo = p_photo_path,
            check_out_lat = p_lat,
            check_out_lng = p_lng,
            effective_hours = ROUND(TIMESTAMPDIFF(MINUTE, check_in, v_now) / 60.0, 2)
          WHERE employee_id = p_employee_id AND attendance_date = v_att_date;
        END IF;

        SELECT ROW_COUNT() AS affected;
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
