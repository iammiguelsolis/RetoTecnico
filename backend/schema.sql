-- =============================================
-- Schema: gestion_gastos_db
-- Tabla: expenses
-- 
-- Ejecutar en MySQL:
--   mysql -u root -p < schema.sql
-- =============================================

CREATE DATABASE IF NOT EXISTS gestion_gastos_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE gestion_gastos_db;

CREATE TABLE IF NOT EXISTS expenses (
  id          VARCHAR(36)    NOT NULL PRIMARY KEY,   -- UUID generado por la app
  title       VARCHAR(100)   NOT NULL,
  reason      VARCHAR(255)   NOT NULL,
  date        DATETIME       NOT NULL,               -- Fecha del gasto
  amount      DECIMAL(12,2)  NOT NULL,
  created_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_expenses_date (date),
  INDEX idx_expenses_year_month (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
