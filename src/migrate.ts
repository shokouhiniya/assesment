import { pool } from './db.js';

const createCorrectionsTable = async () => {
  const query = `
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

    CREATE INDEX IF NOT EXISTS idx_corrections_user_id ON corrections(user_id);
    CREATE INDEX IF NOT EXISTS idx_corrections_created_at ON corrections(created_at);
  `;

  try {
    await pool.query(query);
    console.log('✓ جدول corrections با موفقیت ساخته شد');
    process.exit(0);
  } catch (error) {
    console.error('✗ خطا در ساخت جدول:', error);
    process.exit(1);
  }
};

createCorrectionsTable();
