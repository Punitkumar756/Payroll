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
    for (const table of ['categories', '`groups`', 'sub_groups']) {
      try { await connection.query(`ALTER TABLE ${table} ADD COLUMN remark TEXT NULL`); } catch(e){}
      try { await connection.query(`ALTER TABLE ${table} ADD COLUMN details TEXT NULL`); } catch(e){}
    }
    console.log('Columns ready.');

    console.log('Updating Categories SPs...');
    await connection.query('DROP PROCEDURE IF EXISTS sp_master_category_create');
    await connection.query(`
      CREATE PROCEDURE sp_master_category_create(IN p_caller_role VARCHAR(30), IN p_caller_uid INT UNSIGNED, IN p_code VARCHAR(20), IN p_name VARCHAR(100), IN p_remark TEXT, IN p_details TEXT)
      BEGIN
        DECLARE v_id INT UNSIGNED;
        IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
        INSERT INTO categories (code,name,remark,details) VALUES (TRIM(p_code),TRIM(p_name),p_remark,p_details);
        SET v_id=LAST_INSERT_ID();
        SELECT v_id AS id;
      END
    `);

    await connection.query('DROP PROCEDURE IF EXISTS sp_master_category_update');
    await connection.query(`
      CREATE PROCEDURE sp_master_category_update(IN p_caller_role VARCHAR(30), IN p_caller_uid INT UNSIGNED, IN p_id INT UNSIGNED, IN p_code VARCHAR(20), IN p_name VARCHAR(100), IN p_remark TEXT, IN p_details TEXT, IN p_is_active TINYINT(1))
      BEGIN
        IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
        UPDATE categories SET code=TRIM(p_code), name=TRIM(p_name), remark=p_remark, details=p_details, is_active=p_is_active WHERE id=p_id;
        SELECT ROW_COUNT() AS affected;
      END
    `);

    await connection.query('DROP PROCEDURE IF EXISTS sp_master_category_list');
    await connection.query(`
      CREATE PROCEDURE sp_master_category_list(IN p_caller_role VARCHAR(30))
      BEGIN
        SELECT id, code, name, remark, details, is_active FROM categories ORDER BY name;
      END
    `);

    console.log('Updating Groups SPs...');
    await connection.query('DROP PROCEDURE IF EXISTS sp_master_group_create');
    await connection.query(`
      CREATE PROCEDURE sp_master_group_create(IN p_caller_role VARCHAR(30), IN p_caller_uid INT UNSIGNED, IN p_code VARCHAR(20), IN p_name VARCHAR(100), IN p_remark TEXT, IN p_details TEXT)
      BEGIN
        DECLARE v_id INT UNSIGNED;
        IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
        INSERT INTO \`groups\` (code,name,remark,details) VALUES (TRIM(p_code),TRIM(p_name),p_remark,p_details);
        SET v_id=LAST_INSERT_ID();
        SELECT v_id AS id;
      END
    `);

    await connection.query('DROP PROCEDURE IF EXISTS sp_master_group_update');
    await connection.query(`
      CREATE PROCEDURE sp_master_group_update(IN p_caller_role VARCHAR(30), IN p_caller_uid INT UNSIGNED, IN p_id INT UNSIGNED, IN p_code VARCHAR(20), IN p_name VARCHAR(100), IN p_remark TEXT, IN p_details TEXT, IN p_is_active TINYINT(1))
      BEGIN
        IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
        UPDATE \`groups\` SET code=TRIM(p_code), name=TRIM(p_name), remark=p_remark, details=p_details, is_active=p_is_active WHERE id=p_id;
        SELECT ROW_COUNT() AS affected;
      END
    `);

    await connection.query('DROP PROCEDURE IF EXISTS sp_master_group_list');
    await connection.query(`
      CREATE PROCEDURE sp_master_group_list(IN p_caller_role VARCHAR(30))
      BEGIN
        SELECT id, code, name, remark, details, is_active FROM \`groups\` ORDER BY name;
      END
    `);

    console.log('Updating SubGroups SPs...');
    await connection.query('DROP PROCEDURE IF EXISTS sp_master_subgroup_create');
    await connection.query(`
      CREATE PROCEDURE sp_master_subgroup_create(IN p_caller_role VARCHAR(30), IN p_caller_uid INT UNSIGNED, IN p_code VARCHAR(20), IN p_name VARCHAR(100), IN p_group_id INT UNSIGNED, IN p_remark TEXT, IN p_details TEXT)
      BEGIN
        DECLARE v_id INT UNSIGNED;
        IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
        INSERT INTO sub_groups (code,name,group_id,remark,details) VALUES (TRIM(p_code),TRIM(p_name),p_group_id,p_remark,p_details);
        SET v_id=LAST_INSERT_ID();
        SELECT v_id AS id;
      END
    `);

    await connection.query('DROP PROCEDURE IF EXISTS sp_master_subgroup_update');
    await connection.query(`
      CREATE PROCEDURE sp_master_subgroup_update(IN p_caller_role VARCHAR(30), IN p_caller_uid INT UNSIGNED, IN p_id INT UNSIGNED, IN p_code VARCHAR(20), IN p_name VARCHAR(100), IN p_group_id INT UNSIGNED, IN p_remark TEXT, IN p_details TEXT, IN p_is_active TINYINT(1))
      BEGIN
        IF p_caller_role != 'HR' THEN SIGNAL SQLSTATE '45003' SET MESSAGE_TEXT = 'ACCESS_DENIED:HR_ONLY'; END IF;
        UPDATE sub_groups SET code=TRIM(p_code), name=TRIM(p_name), group_id=p_group_id, remark=p_remark, details=p_details, is_active=p_is_active WHERE id=p_id;
        SELECT ROW_COUNT() AS affected;
      END
    `);

    await connection.query('DROP PROCEDURE IF EXISTS sp_master_subgroup_list');
    await connection.query(`
      CREATE PROCEDURE sp_master_subgroup_list(IN p_caller_role VARCHAR(30))
      BEGIN
        SELECT sg.id, sg.code, sg.name, sg.group_id, g.name AS group_name, sg.remark, sg.details, sg.is_active 
        FROM sub_groups sg LEFT JOIN \`groups\` g ON g.id=sg.group_id ORDER BY sg.name;
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
