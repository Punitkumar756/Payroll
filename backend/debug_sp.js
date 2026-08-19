import mysql from 'mysql2/promise';

async function update() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Punit@12',
        database: 'hrms',
        multipleStatements: true
    });

    try {
        console.log("Updating sp_employee_get_by_id for debugging...");

        await connection.query("DROP PROCEDURE IF EXISTS sp_employee_get_by_id");
        await connection.query(`
            CREATE PROCEDURE sp_employee_get_by_id(
              IN p_caller_role        VARCHAR(30),
              IN p_caller_employee_id INT UNSIGNED,
              IN p_target_employee_id INT UNSIGNED
            )
            BEGIN
              SELECT
                e.id, e.employee_code, e.first_name, e.middle_name, e.last_name,
                e.official_email, e.contact_number, e.status, e.joining_date,
                d.name AS department_name, des.name AS designation_name,
                l.name AS location_name,
                CONCAT(m.first_name,' ',m.last_name) AS reporting_manager_name,
                sd.pf_number, sd.esi_number, sd.uan_number,
                sd.bank_name, sd.bank_ifsc
              FROM employees e
              LEFT JOIN departments d   ON d.id=e.department_id
              LEFT JOIN designations des ON des.id=e.designation_id
              LEFT JOIN locations l     ON l.id=e.location_id
              LEFT JOIN employees m     ON m.id=e.reporting_manager_id
              LEFT JOIN employee_statutory_details sd ON sd.employee_id=e.id
              WHERE e.id = p_target_employee_id;
            END
        `);

        console.log("Done!");
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
}

update();
