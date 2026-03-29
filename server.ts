import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

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
      
      // TODO: Save to database when connected
      // For now, just log it
      console.log('Correction received:', {
        statement,
        indexName,
        originalScore,
        correctedScore,
        levelDefinition,
        logic,
        userId,
        timestamp: new Date().toISOString()
      });
      
      res.json({ success: true, message: 'تصحیح با موفقیت ثبت شد' });
    } catch (error) {
      console.error('Error saving correction:', error);
      res.status(500).json({ error: 'خطا در ثبت تصحیح' });
    }
  });

  // Proxy API route to bypass Mixed Content (HTTPS -> HTTP)
  app.post("/api/proxy/login", async (req, res) => {
    try {
      const response = await fetch('http://f480g0cwgoowgcwwgo8kscwc.46.225.75.168.sslip.io/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      });
      
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error('Proxy error:', error);
      res.status(500).json({ error: 'Failed to fetch from external API' });
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
