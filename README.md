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

## استقرار با Coolify

### تنظیمات در Coolify:

1. **نوع پروژه**: Docker Compose
2. **Repository**: https://github.com/shokouhiniya/assesment.git
3. **Branch**: main

### متغیرهای محیطی (Environment Variables):

در پنل Coolify این متغیرها رو اضافه کن:

```
DB_HOST=db
DB_PORT=5432
DB_NAME=userdb
DB_USER=postgres
DB_PASSWORD=[رمز عبور دلخواه]
PORT=3000
```

### نکات مهم:
- `DB_HOST` باید `db` باشه (نام سرویس در docker-compose)
- Coolify به صورت خودکار دیتابیس PostgreSQL رو با docker-compose بالا میاره
- پورت 3000 به صورت خودکار expose میشه

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
