-- ============================================================================
-- SQL Schema for Course: Internet Programming (Final Exam 2026)
-- Topic: HR Manager & Salary Analytics System
-- Database: ip_std6730251417
-- Student: Kanwit Voottikulsin (std6730251417)
-- ============================================================================

USE ip_std6730251417;

-- 1. Table with student's naming convention: kanwit_6730251417_employee
CREATE TABLE IF NOT EXISTS `kanwit_6730251417_employee` (
  `kanwit_6730251417_ID_Employee` INT AUTO_INCREMENT PRIMARY KEY,
  `kanwit_6730251417_Name_Employee` VARCHAR(255) NOT NULL,
  `kanwit_6730251417_Position_Employee` VARCHAR(255) NOT NULL,
  `kanwit_6730251417_Status_Employee` VARCHAR(50) NOT NULL DEFAULT 'Active',
  `kanwit_6730251417_Salary_Employee` DECIMAL(10,2) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Table with Student's naming convention: FinalExam_Kanwit_Wutt_Employee
CREATE TABLE IF NOT EXISTS `FinalExam_Kanwit_Wutt_Employee` (
  `Kanwit_Wutt_ID_Employee` INT AUTO_INCREMENT PRIMARY KEY,
  `Kanwit_Wutt_Name_Employee` VARCHAR(255) NOT NULL,
  `Kanwit_Wutt_Position_Employee` VARCHAR(255) NOT NULL,
  `Kanwit_Wutt_Status_Employee` VARCHAR(50) NOT NULL DEFAULT 'Active',
  `Kanwit_Wutt_Salary_Employee` DECIMAL(10,2) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Universal employees table for standard compatibility
CREATE TABLE IF NOT EXISTS `employees` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `position` VARCHAR(255) NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'Active',
  `salary` DECIMAL(10,2) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Data (6 Benchmark Employees)
INSERT INTO `kanwit_6730251417_employee` (`kanwit_6730251417_ID_Employee`, `kanwit_6730251417_Name_Employee`, `kanwit_6730251417_Position_Employee`, `kanwit_6730251417_Status_Employee`, `kanwit_6730251417_Salary_Employee`) VALUES
(1, 'John Doe', 'Software Engineer', 'Active', 45000.00),
(2, 'Sarah Jenkins', 'Junior Developer', 'Active', 22000.00),
(3, 'Michael Chang', 'Office Assistant', 'On Leave', 18000.00),
(4, 'Emily Watson', 'Project Manager', 'Active', 52000.00),
(5, 'David Kim', 'Engineering Director', 'Active', 95000.00),
(6, 'Jessica Taylor', 'VP of Technology', 'On Leave', 85000.00)
ON DUPLICATE KEY UPDATE `kanwit_6730251417_Salary_Employee`=VALUES(`kanwit_6730251417_Salary_Employee`);

INSERT INTO `FinalExam_Kanwit_Wutt_Employee` (`Kanwit_Wutt_ID_Employee`, `Kanwit_Wutt_Name_Employee`, `Kanwit_Wutt_Position_Employee`, `Kanwit_Wutt_Status_Employee`, `Kanwit_Wutt_Salary_Employee`) VALUES
(1, 'John Doe', 'Software Engineer', 'Active', 45000.00),
(2, 'Sarah Jenkins', 'Junior Developer', 'Active', 22000.00),
(3, 'Michael Chang', 'Office Assistant', 'On Leave', 18000.00),
(4, 'Emily Watson', 'Project Manager', 'Active', 52000.00),
(5, 'David Kim', 'Engineering Director', 'Active', 95000.00),
(6, 'Jessica Taylor', 'VP of Technology', 'On Leave', 85000.00)
ON DUPLICATE KEY UPDATE `Kanwit_Wutt_Salary_Employee`=VALUES(`Kanwit_Wutt_Salary_Employee`);

INSERT INTO `employees` (`id`, `name`, `position`, `status`, `salary`) VALUES
(1, 'John Doe', 'Software Engineer', 'Active', 45000.00),
(2, 'Sarah Jenkins', 'Junior Developer', 'Active', 22000.00),
(3, 'Michael Chang', 'Office Assistant', 'On Leave', 18000.00),
(4, 'Emily Watson', 'Project Manager', 'Active', 52000.00),
(5, 'David Kim', 'Engineering Director', 'Active', 95000.00),
(6, 'Jessica Taylor', 'VP of Technology', 'On Leave', 85000.00)
ON DUPLICATE KEY UPDATE `salary`=VALUES(`salary`);
