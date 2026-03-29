import express from 'express';
import dotenv from 'dotenv';
import { pool } from './db.js';

dotenv.config();

const app = express();
app.use(express.json());

// دریافت همه یوزرها
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// دریافت یک یوزر با ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'یوزر پیدا نشد' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ساخت یوزر جدید
app.post('/api/users', async (req, res) => {
  try {
    const { first_name, last_name, mobile, has_permission } = req.body;
    
    const result = await pool.query(
      'INSERT INTO users (first_name, last_name, mobile, has_permission) VALUES ($1, $2, $3, $4) RETURNING *',
      [first_name, last_name, mobile, has_permission || false]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// آپدیت یوزر
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, mobile, has_permission } = req.body;
    
    const result = await pool.query(
      'UPDATE users SET first_name = $1, last_name = $2, mobile = $3, has_permission = $4 WHERE id = $5 RETURNING *',
      [first_name, last_name, mobile, has_permission, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'یوزر پیدا نشد' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// حذف یوزر
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'یوزر پیدا نشد' });
    }
    
    res.json({ message: 'یوزر حذف شد', user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`سرور روی پورت ${PORT} در حال اجرا است`);
});
