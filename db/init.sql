CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  stripe_timestamp TIMESTAMP NULL,
  stripe_id VARCHAR(255) NOT NULL,
  transaction_id VARCHAR(255) NOT NULL,
  discord_id VARCHAR(255),
  amount FLOAT NOT NULL
);

CREATE TABLE IF NOT EXISTS jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  scheduled_at TIMESTAMP NULL,
  stripe_id VARCHAR(255) NOT NULL,
  transaction_id VARCHAR(255) NOT NULL,
  discord_id VARCHAR(255),
  try_count INT DEFAULT 0,
  role VARCHAR(30) NOT NULL
);
