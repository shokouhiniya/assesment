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

**Prerequisites:**  Node.js, PostgreSQL


1. Install dependencies:
   `npm install`
2. Create a `.env.local` file with your configuration:
   ```
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=userdb
   DB_USER=postgres
   DB_PASSWORD=your_password
   ```
3. Run database migration:
   `npm run migrate`
4. Run the app:
   `npm run dev`

## OpenRouter Configuration

This app uses OpenRouter to access AI models. Get your API key from [OpenRouter](https://openrouter.ai/keys).

Default model: `google/gemini-2.5-flash` (you can change this in `src/services/openRouterService.ts`)

## Database Setup for Corrections

The correction feature saves user feedback to a PostgreSQL database for future AI model fine-tuning.

### Setup Steps:

1. Make sure PostgreSQL is installed and running
2. Create a database (or use existing one from `api` branch)
3. Add database credentials to `.env.local`
4. Run migration: `npm run migrate`

The corrections table stores:
- Original AI score vs corrected score
- User feedback on level definitions and logic
- Timestamp and user ID for tracking

This data will be used to improve the AI model's accuracy over time.
