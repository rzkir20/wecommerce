-- Run once: mysql -u root -p < schema.sql
CREATE DATABASE IF NOT EXISTS wecommerce
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE wecommerce;

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) NOT NULL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar VARCHAR(512) NULL,
  phone VARCHAR(32) NULL,
  role ENUM('super_admins', 'affiliate', 'users', 'seller') NOT NULL DEFAULT 'users',
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS logs (
  id CHAR(36) NOT NULL PRIMARY KEY,
  action VARCHAR(100) NOT NULL,
  description VARCHAR(1000) NULL,
  target_table VARCHAR(100) NULL,
  target_id VARCHAR(191) NULL,
  user_id CHAR(36) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_logs_user_id (user_id),
  KEY idx_logs_target (target_table, target_id),
  CONSTRAINT fk_logs_user_id FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB;
