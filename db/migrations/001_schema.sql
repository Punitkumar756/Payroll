-- =============================================================
--  HRMS — Ankit Infotech And Solution
--  Migration 001: Full Schema
--  MySQL 8.x
-- =============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- ─────────────────────────────────────────────────────────────
--  MASTER TABLES
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS locations (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code        VARCHAR(20)  NOT NULL UNIQUE,
  name        VARCHAR(100) NOT NULL,
  address     TEXT,
  phone       VARCHAR(20),
  fax         VARCHAR(20),
  website     VARCHAR(200),
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS departments (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code        VARCHAR(20)  NOT NULL UNIQUE,
  name        VARCHAR(100) NOT NULL,
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS designations (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code        VARCHAR(20)  NOT NULL UNIQUE,
  name        VARCHAR(100) NOT NULL,
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categories (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code        VARCHAR(20)  NOT NULL UNIQUE,
  name        VARCHAR(100) NOT NULL,
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `groups` (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code        VARCHAR(20)  NOT NULL UNIQUE,
  name        VARCHAR(100) NOT NULL,
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sub_groups (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  group_id    INT UNSIGNED NOT NULL,
  code        VARCHAR(20)  NOT NULL UNIQUE,
  name        VARCHAR(100) NOT NULL,
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_subgroup_group FOREIGN KEY (group_id) REFERENCES `groups`(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS calendars (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code        VARCHAR(20)  NOT NULL UNIQUE,
  name        VARCHAR(100) NOT NULL,
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS holidays (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code         VARCHAR(20)  NOT NULL UNIQUE,
  name         VARCHAR(200) NOT NULL,
  start_date   DATE NOT NULL,
  end_date     DATE NOT NULL,
  is_week_off  TINYINT(1) NOT NULL DEFAULT 0,
  is_optional  TINYINT(1) NOT NULL DEFAULT 0,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CHECK (end_date >= start_date)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS holiday_calendar_map (
  holiday_id  INT UNSIGNED NOT NULL,
  calendar_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (holiday_id, calendar_id),
  CONSTRAINT fk_hcm_holiday  FOREIGN KEY (holiday_id)  REFERENCES holidays(id) ON DELETE CASCADE,
  CONSTRAINT fk_hcm_calendar FOREIGN KEY (calendar_id) REFERENCES calendars(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS announcements (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  heading         VARCHAR(300) NOT NULL,
  type            VARCHAR(50)  NOT NULL DEFAULT 'General',
  display_start   DATE NOT NULL,
  display_end     DATE NOT NULL,
  content         TEXT,
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  created_by      INT UNSIGNED,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CHECK (display_end >= display_start)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────
--  PEOPLE TABLES
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS roles (
  id    TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(30) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS employees (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  employee_code       VARCHAR(30)  NOT NULL UNIQUE,
  first_name          VARCHAR(80)  NOT NULL,
  middle_name         VARCHAR(80),
  last_name           VARCHAR(80)  NOT NULL,
  date_of_birth       DATE,
  gender              ENUM('Male','Female','Other'),
  joining_date        DATE NOT NULL,
  confirmation_date   DATE,
  separation_date     DATE,
  status              ENUM('Active','Inactive','Resigned','Terminated') NOT NULL DEFAULT 'Active',
  department_id       INT UNSIGNED,
  designation_id      INT UNSIGNED,
  location_id         INT UNSIGNED,
  category_id         INT UNSIGNED,
  group_id            INT UNSIGNED,
  sub_group_id        INT UNSIGNED,
  calendar_id         INT UNSIGNED,
  reporting_manager_id INT UNSIGNED,
  official_email      VARCHAR(200) UNIQUE,
  personal_email      VARCHAR(200),
  contact_number      VARCHAR(20),
  badge_id            VARCHAR(50),
  photo_path          VARCHAR(500),
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_emp_dept      FOREIGN KEY (department_id)       REFERENCES departments(id),
  CONSTRAINT fk_emp_desig     FOREIGN KEY (designation_id)      REFERENCES designations(id),
  CONSTRAINT fk_emp_loc       FOREIGN KEY (location_id)         REFERENCES locations(id),
  CONSTRAINT fk_emp_cat       FOREIGN KEY (category_id)         REFERENCES categories(id),
  CONSTRAINT fk_emp_grp       FOREIGN KEY (group_id)            REFERENCES `groups`(id),
  CONSTRAINT fk_emp_subgrp    FOREIGN KEY (sub_group_id)        REFERENCES sub_groups(id),
  CONSTRAINT fk_emp_cal       FOREIGN KEY (calendar_id)         REFERENCES calendars(id),
  CONSTRAINT fk_emp_manager   FOREIGN KEY (reporting_manager_id) REFERENCES employees(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS employee_statutory_details (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  employee_id     INT UNSIGNED NOT NULL UNIQUE,
  pf_number       VARCHAR(50),
  esi_number      VARCHAR(50),
  pan_encrypted   VARBINARY(500),
  aadhaar_encrypted VARBINARY(500),
  bank_name       VARCHAR(100),
  bank_account_encrypted VARBINARY(500),
  bank_ifsc       VARCHAR(20),
  bank_branch     VARCHAR(100),
  uan_number      VARCHAR(30),
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_stat_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS employee_addresses (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  employee_id     INT UNSIGNED NOT NULL,
  address_type    ENUM('Permanent','Current','Emergency') NOT NULL,
  address_line1   VARCHAR(300),
  address_line2   VARCHAR(300),
  city            VARCHAR(100),
  state           VARCHAR(100),
  pincode         VARCHAR(10),
  country         VARCHAR(100) DEFAULT 'India',
  emergency_contact_name   VARCHAR(200),
  emergency_contact_phone  VARCHAR(20),
  emergency_contact_relation VARCHAR(50),
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_addr_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  UNIQUE KEY uq_emp_addr_type (employee_id, address_type)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  employee_id   INT UNSIGNED UNIQUE,
  username      VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role_id       TINYINT UNSIGNED NOT NULL,
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at DATETIME,
  refresh_token_hash VARCHAR(500),
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_emp  FOREIGN KEY (employee_id) REFERENCES employees(id),
  CONSTRAINT fk_user_role FOREIGN KEY (role_id)     REFERENCES roles(id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────
--  ATTENDANCE TABLES
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS shifts (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code            VARCHAR(20)  NOT NULL UNIQUE,
  name            VARCHAR(100) NOT NULL,
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  grace_late_mins INT UNSIGNED NOT NULL DEFAULT 0,
  grace_early_mins INT UNSIGNED NOT NULL DEFAULT 0,
  ot_eligible     TINYINT(1) NOT NULL DEFAULT 0,
  ot_start_after_mins INT UNSIGNED NOT NULL DEFAULT 0,
  is_night_shift  TINYINT(1) NOT NULL DEFAULT 0,
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS employee_shift_assignments (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  employee_id     INT UNSIGNED NOT NULL,
  shift_id        INT UNSIGNED NOT NULL,
  effective_from  DATE NOT NULL,
  effective_to    DATE,
  created_by      INT UNSIGNED,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_esa_emp   FOREIGN KEY (employee_id) REFERENCES employees(id),
  CONSTRAINT fk_esa_shift FOREIGN KEY (shift_id)    REFERENCES shifts(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS attendance_daily (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  employee_id     INT UNSIGNED NOT NULL,
  attendance_date DATE NOT NULL,
  shift_id        INT UNSIGNED,
  day_status      ENUM('Present','Absent','WeekOff','Holiday','Leave','HalfDay','PaidLeave','UnpaidLeave') NOT NULL DEFAULT 'Absent',
  check_in        DATETIME,
  check_out       DATETIME,
  effective_hours DECIMAL(5,2),
  late_mins       INT DEFAULT 0,
  early_exit_mins INT DEFAULT 0,
  ot_hours        DECIMAL(5,2) DEFAULT 0,
  is_manual       TINYINT(1) NOT NULL DEFAULT 0,
  is_locked       TINYINT(1) NOT NULL DEFAULT 0,
  remarks         VARCHAR(500),
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_emp_date (employee_id, attendance_date),
  CONSTRAINT fk_att_emp   FOREIGN KEY (employee_id) REFERENCES employees(id),
  CONSTRAINT fk_att_shift FOREIGN KEY (shift_id)    REFERENCES shifts(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS attendance_correction_requests (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  employee_id     INT UNSIGNED NOT NULL,
  attendance_date DATE NOT NULL,
  requested_check_in  DATETIME,
  requested_check_out DATETIME,
  reason          VARCHAR(1000) NOT NULL,
  status          ENUM('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
  reviewed_by     INT UNSIGNED,
  reviewed_at     DATETIME,
  reviewer_remarks VARCHAR(500),
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_acr_emp FOREIGN KEY (employee_id) REFERENCES employees(id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────
--  LEAVE TABLES
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS leave_types (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code            VARCHAR(20)  NOT NULL UNIQUE,
  name            VARCHAR(100) NOT NULL,
  is_paid         TINYINT(1) NOT NULL DEFAULT 1,
  allow_carry_forward TINYINT(1) NOT NULL DEFAULT 0,
  max_carry_forward INT UNSIGNED DEFAULT 0,
  allow_negative  TINYINT(1) NOT NULL DEFAULT 0,
  requires_document TINYINT(1) NOT NULL DEFAULT 0,
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS leave_policies (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code            VARCHAR(20)  NOT NULL UNIQUE,
  name            VARCHAR(100) NOT NULL,
  accrual_frequency ENUM('Monthly','Quarterly','Yearly','None') NOT NULL DEFAULT 'None',
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS leave_policy_types (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  policy_id           INT UNSIGNED NOT NULL,
  leave_type_id       INT UNSIGNED NOT NULL,
  annual_entitlement  DECIMAL(6,2) NOT NULL DEFAULT 0,
  accrual_per_period  DECIMAL(6,2) NOT NULL DEFAULT 0,
  UNIQUE KEY uq_pol_type (policy_id, leave_type_id),
  CONSTRAINT fk_lpt_policy FOREIGN KEY (policy_id)     REFERENCES leave_policies(id) ON DELETE CASCADE,
  CONSTRAINT fk_lpt_type   FOREIGN KEY (leave_type_id) REFERENCES leave_types(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS employee_leave_policy (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  employee_id     INT UNSIGNED NOT NULL UNIQUE,
  policy_id       INT UNSIGNED NOT NULL,
  effective_from  DATE NOT NULL,
  CONSTRAINT fk_elp_emp    FOREIGN KEY (employee_id) REFERENCES employees(id),
  CONSTRAINT fk_elp_policy FOREIGN KEY (policy_id)   REFERENCES leave_policies(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS leave_balances (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  employee_id     INT UNSIGNED NOT NULL,
  leave_type_id   INT UNSIGNED NOT NULL,
  year            YEAR NOT NULL,
  opening_balance DECIMAL(6,2) NOT NULL DEFAULT 0,
  accrued         DECIMAL(6,2) NOT NULL DEFAULT 0,
  used            DECIMAL(6,2) NOT NULL DEFAULT 0,
  carried_forward DECIMAL(6,2) NOT NULL DEFAULT 0,
  closing_balance DECIMAL(6,2) GENERATED ALWAYS AS (opening_balance + accrued - used + carried_forward) STORED,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_emp_type_year (employee_id, leave_type_id, year),
  CONSTRAINT fk_lb_emp  FOREIGN KEY (employee_id)  REFERENCES employees(id),
  CONSTRAINT fk_lb_type FOREIGN KEY (leave_type_id) REFERENCES leave_types(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS leave_applications (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  employee_id     INT UNSIGNED NOT NULL,
  leave_type_id   INT UNSIGNED NOT NULL,
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  total_days      DECIMAL(5,2) NOT NULL,
  reason          VARCHAR(1000),
  document_path   VARCHAR(500),
  status          ENUM('Pending','Approved','Rejected','Cancelled') NOT NULL DEFAULT 'Pending',
  applied_by      INT UNSIGNED,
  approved_by     INT UNSIGNED,
  approved_at     DATETIME,
  approver_remarks VARCHAR(500),
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_la_emp  FOREIGN KEY (employee_id)  REFERENCES employees(id),
  CONSTRAINT fk_la_type FOREIGN KEY (leave_type_id) REFERENCES leave_types(id),
  CHECK (end_date >= start_date)
) ENGINE=InnoDB;



-- ─────────────────────────────────────────────────────────────
--  SYSTEM TABLES
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_log (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         INT UNSIGNED,
  role_name       VARCHAR(30),
  procedure_name  VARCHAR(100) NOT NULL,
  record_id       VARCHAR(50),
  action          VARCHAR(30) NOT NULL,
  old_values      JSON,
  new_values      JSON,
  ip_address      VARCHAR(45),
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_user  (user_id),
  INDEX idx_audit_proc  (procedure_name),
  INDEX idx_audit_date  (created_at)
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
