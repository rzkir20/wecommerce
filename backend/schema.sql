-- Run once: mysql -u root -p < schema.sql
CREATE DATABASE IF NOT EXISTS wecommerce
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE wecommerce;

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) NOT NULL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;
