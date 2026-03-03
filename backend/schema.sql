-- =============================================
-- Schema v2: gestion_gastos_db
-- Tablas: users, expenses
-- =============================================

CREATE DATABASE IF NOT EXISTS gestion_gastos_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE gestion_gastos_db;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id              VARCHAR(36)    NOT NULL PRIMARY KEY,
  name            VARCHAR(100)   NOT NULL,
  email           VARCHAR(255)   NOT NULL UNIQUE,
  password_hash   VARCHAR(255)   NOT NULL,
  monthly_budget  DECIMAL(12,2)  NOT NULL DEFAULT 5000.00,
  created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de gastos (vinculada a usuarios)
CREATE TABLE IF NOT EXISTS expenses (
  id              VARCHAR(36)    NOT NULL PRIMARY KEY,
  user_id         VARCHAR(36)    NOT NULL,
  title           VARCHAR(100)   NOT NULL,
  reason          VARCHAR(255)   NOT NULL,
  date            DATETIME       NOT NULL,
  amount          DECIMAL(12,2)  NOT NULL,
  priority_level  ENUM('LOW','MEDIUM','HIGH') NOT NULL DEFAULT 'LOW',
  reminder_date   DATETIME       NULL,
  created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_expenses_user (user_id),
  INDEX idx_expenses_date (date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
