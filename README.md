<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Policy Analysis Tool with AI

ابزار تحلیل هوشمند سیاست‌های ارزی با استفاده از OpenRouter و مدل‌های زبانی پیشرفته.

## Features

- تحلیل خودکار گزاره‌های سیاستی بر اساس شاخص‌های حاکمیت ملی
- رابط کاربری فارسی با طراحی مدرن
- پشتیبانی از مدل‌های مختلف از طریق OpenRouter
- سیستم تصحیح و بازخورد برای بهبود دقت

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create a `.env.local` file and set your `OPENROUTER_API_KEY`:
   ```
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```
3. Run the app:
   `npm run dev`

## OpenRouter Configuration

This app uses OpenRouter to access AI models. Get your API key from [OpenRouter](https://openrouter.ai/keys).

Default model: `google/gemini-2.5-flash` (you can change this in `src/services/openRouterService.ts`)

## Database Setup for Corrections

The correction feature requires a PostgreSQL database (from the `api` branch). 

To set up the corrections table, run the SQL in `corrections-migration.sql` on your database:

```bash
psql -U your_user -d your_database -f corrections-migration.sql
```

The corrections are saved for future AI model fine-tuning and improvement.
