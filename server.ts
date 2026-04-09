import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { pool } from "./src/db.js";

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoint to get OpenRouter API key
  app.get("/api/config", (req, res) => {
    res.json({
      openRouterApiKey: process.env.OPENROUTER_API_KEY || ""
    });
  });

  // Save correction to database (for future AI training)
  app.post("/api/corrections", async (req, res) => {
    try {
      const { statement, indexName, originalScore, correctedScore, levelDefinition, logic, userId } = req.body;
      
      const query = `
        INSERT INTO corrections (user_id, statement, index_name, original_score, corrected_score, level_definition, logic)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, created_at
      `;
      
      const result = await pool.query(query, [
        userId,
        statement,
        indexName,
        originalScore,
        correctedScore,
        levelDefinition,
        logic
      ]);
      
      console.log('✓ Correction saved:', result.rows[0]);
      res.json({ success: true, message: 'تصحیح با موفقیت ثبت شد', data: result.rows[0] });
    } catch (error) {
      console.error('✗ Error saving correction:', error);
      res.status(500).json({ error: 'خطا در ثبت تصحیح' });
    }
  });

  // AI Analysis endpoint (server-side to avoid CORS)
  app.post("/api/analyze", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: 'متن ورودی الزامی است' });

      const SYSTEM_INSTRUCTION = `You are an expert Policy Analyst AI specializing in "National Sovereignty over Foreign Exchange".
CRITICAL: You MUST respond in Persian (Farsi) language.

### RULES:
1. Each independent policy statement is one unit. Analyze them separately.
2. Only code what is explicitly said. No irony or personal interpretations.
3. Do not guess intent. Only analyze literal text.

### INDICES:
#### Index 1: بازگشت ارز صادراتی (Weight: 0.4)
5: بازگشت کامل و اجباری بدون استثنا | 4: بازگشت اجباری با انعطاف اداری محدود | 3: بازگشت جزئی یا مشروط | 2: بازگشت داوطلبانه یا مبتنی بر مشوق | 1: مخالفت ضمنی با بازگشت اجباری | 0: رد کامل بازگشت اجباری

#### Index 2: تخصیص و توزیع ارز (Weight: 0.3)
5: تخصیص کامل و متمرکز توسط دولت | 4: نقش غالب دولت با ابزارهای مکمل بازار | 3: مدل ترکیبی | 2: نقش محدود دولت | 1: حداقل مداخله دولت | 0: رد کامل نقش دولت

#### Index 3: عدالت در نرخ‌گذاری (Weight: 0.3)
5: نرخ تعیین شده توسط دولت | 4: مدیریت فعال دولت برای تعادل ذینفعان | 3: شناور مدیریت شده | 2: حداقل مداخله | 1: نرخ آزاد با نگرانی‌های محدود | 0: بازار کاملاً آزاد

### OUTPUT: Return ONLY a JSON array. ALL fields in Persian.
[{"statement":"گزاره","indexName":"نام شاخص","score":4,"levelDefinition":"تعریف سطح","logic":"منطق ارزیابی"}]`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: SYSTEM_INSTRUCTION },
            { role: 'user', content: `Analyze this and return ONLY a JSON array:\n\n${text}` }
          ]
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        console.error('OpenRouter error:', err);
        return res.status(500).json({ error: 'خطا در ارتباط با هوش مصنوعی' });
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      let jsonStr = content.trim();
      if (jsonStr.startsWith('```json')) jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      else if (jsonStr.startsWith('```')) jsonStr = jsonStr.replace(/```\n?/g, '');

      const parsed = JSON.parse(jsonStr);
      const results = Array.isArray(parsed) ? parsed : (parsed.results || []);
      
      console.log('✓ Analysis complete:', results.length, 'results');
      res.json({ results });
    } catch (error) {
      console.error('✗ Analysis error:', error);
      res.status(500).json({ error: 'خطا در تحلیل' });
    }
  });

  // Login endpoint - directly query database
  app.post("/api/proxy/login", async (req, res) => {
    try {
      const { mobile, password } = req.body;

      if (!mobile || !password) {
        return res.status(400).json({ error: 'موبایل و رمز عبور الزامی است', has_permission: false });
      }

      const result = await pool.query(
        'SELECT id, has_permission FROM users WHERE mobile = $1 AND password = $2',
        [mobile, password]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'موبایل یا رمز عبور اشتباه است', has_permission: false });
      }

      res.json({ id: result.rows[0].id, has_permission: result.rows[0].has_permission });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'خطا در ارتباط با سرور', has_permission: false });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
