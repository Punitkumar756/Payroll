-- ============================================
-- SQL Schema for Payroll System Features
-- ============================================

-- 1. Employees Table
CREATE TABLE IF NOT EXISTS `employees` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `employee_id` VARCHAR(50) UNIQUE NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `department` VARCHAR(255),
  `designation` VARCHAR(255),
  `join_date` DATE,
  `status` VARCHAR(50) DEFAULT 'Active',
  `esi_number` VARCHAR(100),
  `epf_number` VARCHAR(100),
  `bank_account` VARCHAR(100),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Departments Table
CREATE TABLE IF NOT EXISTS `departments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `head` VARCHAR(255),
  `payroll` DECIMAL(15, 2) DEFAULT 0.00,
  `color` VARCHAR(50),
  `icon_key` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Payslips Table
CREATE TABLE IF NOT EXISTS `payslips` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `dept` VARCHAR(255),
  `financialYear` VARCHAR(50),
  `period` VARCHAR(50),
  `status` VARCHAR(50) DEFAULT 'Pending',
  `message` TEXT,
  `date` DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Payslip Components Table
CREATE TABLE IF NOT EXISTS `payslip_components` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `type` VARCHAR(50),
  `amount` DECIMAL(10, 2) DEFAULT 0.00,
  `status` VARCHAR(50) DEFAULT 'Active'
);

-- 5. Salary Heads Table
CREATE TABLE IF NOT EXISTS `salary_heads` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `salaryType` VARCHAR(50),
  `headCategory` VARCHAR(50),
  `expression` TEXT,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 6. Advance Payments Table
CREATE TABLE IF NOT EXISTS `advance_payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `employee` VARCHAR(255) NOT NULL,
  `financial_year` VARCHAR(50),
  `pay_period` VARCHAR(50),
  `item` VARCHAR(255),
  `remarks` TEXT,
  `amount` DECIMAL(10, 2) DEFAULT 0.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 7. Timesheets Table
CREATE TABLE IF NOT EXISTS `timesheets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255),
  `dept` VARCHAR(255),
  `period` VARCHAR(50),
  `month` VARCHAR(50),
  `totalDays` INT DEFAULT 0,
  `daysPresent` INT DEFAULT 0,
  `daysAbsent` INT DEFAULT 0,
  `holidays` INT DEFAULT 0,
  `weekoffs` INT DEFAULT 0,
  `holidaysWorked` INT DEFAULT 0,
  `weekoffsWorked` INT DEFAULT 0,
  `shortHoursWorked` DECIMAL(10, 2) DEFAULT 0,
  `earlyDays` INT DEFAULT 0,
  `lateDays` INT DEFAULT 0,
  `paidLeaves` INT DEFAULT 0,
  `unpaidLeaves` INT DEFAULT 0,
  `hoursWorked` DECIMAL(10, 2) DEFAULT 0,
  `hoursWorkedOnHoliday` DECIMAL(10, 2) DEFAULT 0,
  `hoursWorkedOnWeekoff` DECIMAL(10, 2) DEFAULT 0,
  `lateHours` DECIMAL(10, 2) DEFAULT 0,
  `earlyHours` DECIMAL(10, 2) DEFAULT 0,
  `otHoursWorked` DECIMAL(10, 2) DEFAULT 0,
  `shortNormalHours` DECIMAL(10, 2) DEFAULT 0,
  `shortOtHours` DECIMAL(10, 2) DEFAULT 0,
  `shortSpecialOtHours` DECIMAL(10, 2) DEFAULT 0,
  `splOtHoursWorked` DECIMAL(10, 2) DEFAULT 0,
  `status` VARCHAR(50) DEFAULT 'Pending',
  `updated` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- Insert Initial Default Departments (Optional)
-- ============================================
INSERT IGNORE INTO \`departments\` (\`name\`, \`head\`, \`color\`, \`icon_key\`) VALUES 
('IT Department', 'Rahul Sharma', '#6366f1', 'Monitor'),
('HR Department', 'Priya Singh', '#3b82f6', 'User'),
('Finance Department', 'Amit Kumar', '#06b6d4', 'Wallet'),
('Operations', 'Neha Verma', '#10b981', 'TrendingUp');
