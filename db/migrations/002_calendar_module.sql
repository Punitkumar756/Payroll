-- Migration 002: Calendar Module

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Drop existing map and holidays
DROP TABLE IF EXISTS holiday_calendar_map;
DROP TABLE IF EXISTS holidays;

-- 2. Alter calendars table
ALTER TABLE calendars
  DROP COLUMN name,
  CHANGE COLUMN code calendar_code VARCHAR(30) NOT NULL UNIQUE,
  ADD COLUMN calendar_name VARCHAR(100) NOT NULL AFTER calendar_code,
  ADD COLUMN year YEAR NOT NULL AFTER calendar_name,
  ADD COLUMN location_id INT UNSIGNED NULL AFTER year,
  ADD COLUMN description VARCHAR(500) NULL AFTER location_id,
  ADD COLUMN status ENUM('Active', 'Inactive', 'Archived') NOT NULL DEFAULT 'Active' AFTER description,
  ADD CONSTRAINT fk_cal_loc FOREIGN KEY (location_id) REFERENCES locations(id);

-- 3. Create calendar_weekly_offs
CREATE TABLE IF NOT EXISTS calendar_weekly_offs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  calendar_id INT UNSIGNED NOT NULL,
  day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
  week_pattern ENUM('EVERY', '1ST', '2ND', '3RD', '4TH', '5TH', 'ALTERNATE') NOT NULL DEFAULT 'EVERY',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  CONSTRAINT fk_cwo_calendar FOREIGN KEY (calendar_id) REFERENCES calendars(id) ON DELETE CASCADE,
  UNIQUE KEY uq_cwo_pattern (calendar_id, day_of_week, week_pattern)
) ENGINE=InnoDB;

-- 4. Create calendar_holidays
CREATE TABLE IF NOT EXISTS calendar_holidays (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  calendar_id INT UNSIGNED NOT NULL,
  holiday_date DATE NOT NULL,
  holiday_name VARCHAR(200) NOT NULL,
  holiday_type VARCHAR(50) NOT NULL DEFAULT 'National',
  is_optional TINYINT(1) NOT NULL DEFAULT 0,
  description VARCHAR(500),
  status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ch_calendar FOREIGN KEY (calendar_id) REFERENCES calendars(id) ON DELETE CASCADE,
  UNIQUE KEY uq_ch_date (calendar_id, holiday_date)
) ENGINE=InnoDB;

-- 5. Create calendar_date_overrides
CREATE TABLE IF NOT EXISTS calendar_date_overrides (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  calendar_id INT UNSIGNED NOT NULL,
  date DATE NOT NULL,
  original_status VARCHAR(50),
  override_status ENUM('WORKING_DAY', 'WEEKLY_OFF', 'HOLIDAY', 'OPTIONAL_HOLIDAY') NOT NULL,
  reason VARCHAR(500) NOT NULL,
  created_by INT UNSIGNED,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cdo_calendar FOREIGN KEY (calendar_id) REFERENCES calendars(id) ON DELETE CASCADE,
  UNIQUE KEY uq_cdo_date (calendar_id, date)
) ENGINE=InnoDB;

-- 6. Create employee_calendar (for assigning calendars to employees explicitly)
CREATE TABLE IF NOT EXISTS employee_calendar (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  employee_id INT UNSIGNED NOT NULL,
  calendar_id INT UNSIGNED NOT NULL,
  effective_from DATE NOT NULL,
  effective_to DATE,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  CONSTRAINT fk_ec_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  CONSTRAINT fk_ec_calendar FOREIGN KEY (calendar_id) REFERENCES calendars(id) ON DELETE CASCADE
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
