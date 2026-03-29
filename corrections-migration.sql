-- Migration for corrections table
-- This should be added to the api branch database

CREATE TABLE IF NOT EXISTS corrections (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  statement TEXT NOT NULL,
  index_name VARCHAR(255) NOT NULL,
  original_score DECIMAL(3,1) NOT NULL,
  corrected_score DECIMAL(3,1) NOT NULL,
  level_definition TEXT NOT NULL,
  logic TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_corrections_user_id ON corrections(user_id);
CREATE INDEX idx_corrections_created_at ON corrections(created_at);
