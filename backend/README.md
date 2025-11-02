# RAIMES Backend API

Backend API untuk sistem RAIMES menggunakan Node.js, TypeScript, Express, dan PostgreSQL.

## 🚀 Fitur

- ✅ Authentication dengan JWT
- ✅ Password hashing dengan bcrypt
- ✅ Parameterized queries untuk mencegah SQL injection
- ✅ CORS support
- ✅ Environment variables
- ✅ TypeScript untuk type safety

## 📋 Prerequisites

- Node.js (v18 atau lebih baru)
- PostgreSQL (v12 atau lebih baru)
- npm atau yarn

## 🔧 Installation

1. Install dependencies:
```bash
npm install
```

2. Setup database:
```bash
# Buat database PostgreSQL
createdb raimes_db

# Jalankan schema
psql -d raimes_db -f insert.sql
```

3. Setup environment variables:
```bash
# Copy .env.example ke .env
cp .env.example .env

# Edit .env dan sesuaikan dengan konfigurasi Anda
```

4. Konfigurasi `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=raimes_db
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=24h

PORT=3000
NODE_ENV=development

FRONTEND_URL=http://localhost:5173
```

## 🏃 Running the Application

### Development mode:
```bash
npm run dev
```

### Production mode:
```bash
# Build TypeScript
npm run build

# Start server
npm start
```

## 📡 API Endpoints

### Authentication

#### 1. Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "password": "password123",
  "email": "john@example.com",
  "role": "user"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userID": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userID": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

#### 3. Get Current User (Protected)
```http
GET /api/auth/me
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userid": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### 4. Logout
```http
POST /api/auth/logout
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### General

#### Health Check
```http
GET /
```

**Response:**
```json
{
  "message": "RAIMES Backend API",
  "version": "1.0.0",
  "status": "running"
}
```

#### Status Check
```http
GET /api/status
```

**Response:**
```json
{
  "status": "OK",
  "environment": "development",
  "timestamp": "2024-11-02T10:30:00.000Z"
}
```

## 🔐 Security Features

### 1. Parameterized Queries
Semua query database menggunakan parameterized queries untuk mencegah SQL injection:

```typescript
// ❌ JANGAN seperti ini (vulnerable to SQL injection)
const query = `SELECT * FROM "User" WHERE username = '${username}'`;

// ✅ Gunakan parameterized query
const query = 'SELECT * FROM "User" WHERE username = $1';
const result = await pool.query(query, [username]);
```

### 2. Password Hashing
Password di-hash menggunakan bcrypt sebelum disimpan ke database:

```typescript
const saltRounds = 10;
const hashedPassword = await bcrypt.hash(password, saltRounds);
```

### 3. JWT Authentication
Token JWT digunakan untuk autentikasi. Token harus disertakan dalam header:

```
Authorization: Bearer <token>
```

### 4. CORS Protection
CORS dikonfigurasi untuk hanya menerima request dari frontend yang diizinkan.

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # Database connection configuration
│   ├── controllers/
│   │   └── authController.ts    # Authentication logic
│   ├── middleware/
│   │   └── auth.ts               # JWT authentication middleware
│   ├── routes/
│   │   └── authRoutes.ts        # Authentication routes
│   └── app.ts                    # Main application entry point
├── .env                          # Environment variables (don't commit!)
├── .env.example                  # Environment variables template
├── .gitignore                    # Git ignore rules
├── insert.sql                    # Database schema
├── seed_users.sql               # Sample user data
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This file
```

## 🧪 Testing dengan Postman/Thunder Client

### 1. Register User
- Method: POST
- URL: `http://localhost:3000/api/auth/register`
- Body (JSON):
```json
{
  "username": "testuser",
  "password": "password123",
  "email": "test@example.com",
  "role": "user"
}
```

### 2. Login
- Method: POST
- URL: `http://localhost:3000/api/auth/login`
- Body (JSON):
```json
{
  "username": "testuser",
  "password": "password123"
}
```

### 3. Get Current User
- Method: GET
- URL: `http://localhost:3000/api/auth/me`
- Headers:
  - `Authorization: Bearer <token-from-login-response>`

## ⚠️ Common Issues

### Error: Cannot find module
Pastikan semua import menggunakan ekstensi `.js`:
```typescript
import authRoutes from './routes/authRoutes.js';  // ✅ Correct
import authRoutes from './routes/authRoutes';     // ❌ Wrong
```

### Error: Connection refused
Pastikan PostgreSQL sudah running dan konfigurasi di `.env` sudah benar.

### Error: Invalid token
Token JWT mungkin expired atau invalid. Login ulang untuk mendapatkan token baru.

## 📝 Notes

- Roles yang valid: `admin`, `user`, `auditor`
- JWT token expired dalam 24 jam (dapat diubah di `.env`)
- Password minimal 6 karakter (dapat ditambahkan validasi)
- Semua password di-hash dengan bcrypt saltRounds=10

## 🔄 Development Tips

1. **Menambahkan endpoint baru:**
   - Buat controller di `src/controllers/`
   - Buat route di `src/routes/`
   - Register route di `src/app.ts`

2. **Protected endpoints:**
   ```typescript
   router.get('/protected', authenticateToken, yourController);
   ```

3. **Role-based access:**
   ```typescript
   router.get('/admin', authenticateToken, authorizeRoles('admin'), adminController);
   ```

## 📄 License

ISC

## 👥 Authors

RAIMES Development Team
