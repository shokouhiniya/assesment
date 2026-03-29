import { pool } from './db.js';

const createTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      mobile VARCHAR(15) NOT NULL UNIQUE,
      has_permission BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  try {
    await pool.query(query);
    console.log('جدول users با موفقیت ساخته شد');
    process.exit(0);
  } catch (error) {
    console.error('خطا در ساخت جدول:', error);
    process.exit(1);
  }
};

createTable();
