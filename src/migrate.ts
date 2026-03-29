import { pool } from './db.js';

const createCorrectionsTable = async () => {
  console.log('DB Config:', {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    passwordLength: process.env.DB_PASSWORD?.length
  });

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
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('✗ خطا در ساخت جدول:', error);
    await pool.end();
    process.exit(1);
  }
};

createCorrectionsTable();
