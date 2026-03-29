# User API

یک API ساده برای مدیریت کاربران با PostgreSQL

## ساختار دیتابیس

جدول `users` شامل فیلدهای زیر است:
- `id`: شناسه یکتا (SERIAL)
- `first_name`: نام (VARCHAR)
- `last_name`: نام خانوادگی (VARCHAR)
- `mobile`: شماره موبایل (VARCHAR - UNIQUE)
- `has_permission`: مجوز دسترسی (BOOLEAN)
- `created_at`: تاریخ ایجاد (TIMESTAMP)

## نصب و راه‌اندازی

1. نصب وابستگی‌ها:
```bash
npm install
```

2. تنظیم متغیرهای محیطی:
- فایل `.env` را ویرایش کنید و اطلاعات دیتابیس را وارد کنید

3. ساخت جدول:
```bash
npm run migrate
```

4. اجرای سرور:
```bash
npm run dev
```

## API Endpoints

### دریافت همه کاربران
```
GET /api/users
```

### دریافت یک کاربر
```
GET /api/users/:id
```

### ساخت کاربر جدید
```
POST /api/users
Content-Type: application/json

{
  "first_name": "علی",
  "last_name": "احمدی",
  "mobile": "09123456789",
  "has_permission": true
}
```

### آپدیت کاربر
```
PUT /api/users/:id
Content-Type: application/json

{
  "first_name": "علی",
  "last_name": "احمدی",
  "mobile": "09123456789",
  "has_permission": false
}
```

### حذف کاربر
```
DELETE /api/users/:id
```
