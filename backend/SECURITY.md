# Security Implementation - RAIMES Backend

## 🔐 Fitur Keamanan yang Diimplementasikan

### 1. Parameterized Queries (Prepared Statements)

#### ❌ **JANGAN** seperti ini (Vulnerable to SQL Injection):
```typescript
const username = req.body.username;
const query = `SELECT * FROM "User" WHERE username = '${username}'`;
const result = await pool.query(query);
```

**Masalah**: Attacker bisa inject SQL code melalui input:
```
username: "admin' OR '1'='1"
Query jadi: SELECT * FROM "User" WHERE username = 'admin' OR '1'='1'
Result: Bypass authentication!
```

#### ✅ **GUNAKAN** Parameterized Query:
```typescript
const username = req.body.username;
const query = 'SELECT * FROM "User" WHERE username = $1';
const result = await pool.query(query, [username]);
```

**Keuntungan**:
- Input di-escape otomatis oleh database driver
- SQL injection tidak mungkin terjadi
- Query lebih cepat (cached execution plan)

### 2. Password Hashing dengan bcrypt

#### Mengapa tidak boleh simpan plain password?
```typescript
// ❌ SANGAT BAHAYA!
INSERT INTO "User" (username, password) VALUES ('john', 'password123');
```

**Risiko**:
- Jika database bocor, semua password terbaca
- Admin bisa lihat password user
- Password bisa digunakan di sistem lain

#### ✅ Implementasi yang Benar:
```typescript
import bcrypt from 'bcryptjs';

// Saat register
const password = req.body.password;
const saltRounds = 10;
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Hash yang disimpan: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
await pool.query(
    'INSERT INTO "User" (username, password) VALUES ($1, $2)',
    [username, hashedPassword]
);

// Saat login
const user = await pool.query(
    'SELECT * FROM "User" WHERE username = $1',
    [username]
);
const isValid = await bcrypt.compare(inputPassword, user.rows[0].password);
```

**Cara Kerja bcrypt**:
1. **Salt**: Random string ditambahkan ke password
2. **Multiple rounds**: Hash dilakukan 2^10 = 1024 kali
3. **One-way**: Tidak bisa di-decrypt, hanya bisa di-verify

### 3. JWT (JSON Web Token) Authentication

#### Cara Kerja:
```
1. User login → Server verify credentials
2. Server generate JWT token dengan secret key
3. Token dikirim ke client
4. Client simpan token (localStorage/sessionStorage)
5. Setiap request, client kirim token di header
6. Server verify token sebelum proses request
```

#### Implementasi:
```typescript
// Generate token (di authController.ts)
const jwtSecret: string = process.env.JWT_SECRET || 'default_secret';
const expiresIn: string = process.env.JWT_EXPIRES_IN || '24h';
const token = jwt.sign(
    {
        userID: user.userid,
        username: user.username,
        email: user.email,
        role: user.role
    },
    jwtSecret,
    { expiresIn }
);

// Verify token (di middleware/auth.ts)
const token = req.headers['authorization']?.split(' ')[1];
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

**Token Structure**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.     ← Header
eyJ1c2VySUQiOjEsInVzZXJuYW1lIjoiam9obiJ9. ← Payload (base64)
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c   ← Signature
```

### 4. CORS (Cross-Origin Resource Sharing)

#### Konfigurasi:
```typescript
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
```

**Fungsi**:
- Hanya frontend tertentu yang bisa akses API
- Mencegah request dari domain tidak dikenal
- Protect dari CSRF attacks

### 5. Environment Variables

#### ❌ **JANGAN** hardcode secrets:
```typescript
const JWT_SECRET = 'my_super_secret_key';  // BAHAYA!
const DB_PASSWORD = 'postgres123';         // BAHAYA!
```

#### ✅ **GUNAKAN** .env file:
```env
# .env
JWT_SECRET=raimes_secret_key_production_2024
DB_PASSWORD=complex_database_password_here
```

```typescript
// Akses di code
const secret = process.env.JWT_SECRET;
```

**Keuntungan**:
- Secrets tidak masuk ke Git repository
- Beda environment bisa punya konfigurasi berbeda
- Gampang di-rotate kalau ada breach

### 6. Input Validation

#### Implementasi Basic:
```typescript
// Validasi required fields
if (!username || !password || !email) {
    return res.status(400).json({
        success: false,
        message: 'All fields are required'
    });
}

// Validasi role
const validRoles = ['admin', 'user', 'auditor'];
if (!validRoles.includes(role.toLowerCase())) {
    return res.status(400).json({
        success: false,
        message: 'Invalid role'
    });
}
```

#### Bisa ditingkatkan dengan library validator:
```bash
npm install validator
```

```typescript
import validator from 'validator';

// Validasi email format
if (!validator.isEmail(email)) {
    return res.status(400).json({
        message: 'Invalid email format'
    });
}

// Validasi password strength
if (!validator.isStrongPassword(password)) {
    return res.status(400).json({
        message: 'Password too weak'
    });
}
```

## 🛡️ Security Checklist

### ✅ Yang Sudah Diimplementasikan:
- [x] Parameterized queries untuk semua database operations
- [x] Password hashing dengan bcrypt
- [x] JWT authentication
- [x] CORS protection
- [x] Environment variables untuk secrets
- [x] Input validation
- [x] Error handling yang tidak expose sensitive info

### 📋 Rekomendasi Tambahan untuk Production:

#### 1. Rate Limiting
```bash
npm install express-rate-limit
```

```typescript
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 5, // max 5 attempts
    message: 'Too many login attempts, please try again later'
});

app.post('/api/auth/login', loginLimiter, login);
```

#### 2. Helmet (Security Headers)
```bash
npm install helmet
```

```typescript
import helmet from 'helmet';
app.use(helmet());
```

#### 3. Request Sanitization
```bash
npm install express-mongo-sanitize xss-clean
```

```typescript
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';

app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(xss()); // Prevent XSS attacks
```

#### 4. HTTPS in Production
```typescript
// Redirect HTTP to HTTPS
app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
        res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
        next();
    }
});
```

#### 5. Logging & Monitoring
```bash
npm install morgan winston
```

```typescript
import morgan from 'morgan';
import winston from 'winston';

// HTTP request logging
app.use(morgan('combined'));

// Application logging
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});
```

## 🚨 Common Security Mistakes

### 1. SQL Injection
```typescript
// ❌ WRONG
const query = `SELECT * FROM User WHERE id = ${userId}`;

// ✅ CORRECT
const query = 'SELECT * FROM User WHERE id = $1';
await pool.query(query, [userId]);
```

### 2. Password Storage
```typescript
// ❌ WRONG
await pool.query('INSERT INTO User VALUES ($1, $2)', [username, password]);

// ✅ CORRECT
const hashedPassword = await bcrypt.hash(password, 10);
await pool.query('INSERT INTO User VALUES ($1, $2)', [username, hashedPassword]);
```

### 3. JWT Secret
```typescript
// ❌ WRONG
jwt.sign(payload, 'mysecret');

// ✅ CORRECT
jwt.sign(payload, process.env.JWT_SECRET);
```

### 4. Error Messages
```typescript
// ❌ WRONG - Expose too much info
catch (error) {
    res.json({ error: error.message, stack: error.stack });
}

// ✅ CORRECT - Generic message
catch (error) {
    console.error(error); // Log for debugging
    res.status(500).json({ message: 'Internal server error' });
}
```

## 📚 Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Checklist](https://github.com/goldbergyoni/nodebestpractices#6-security-best-practices)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

## 🎯 Testing Security

### Test SQL Injection:
```bash
# Coba inject di username
POST /api/auth/login
{
  "username": "admin' OR '1'='1",
  "password": "anything"
}
# Harus GAGAL dengan parameterized query
```

### Test Password Hashing:
```bash
# Check database
SELECT password FROM "User" LIMIT 1;
# Harus muncul hash, bukan plain text
# Contoh: $2a$10$N9qo8uLOickgx2ZMRZoMyeIj...
```

### Test JWT Expiration:
```bash
# Generate token, tunggu sampai expired
GET /api/auth/me
Authorization: Bearer <expired_token>
# Harus return 403 Forbidden
```

---

**Last Updated**: November 2, 2024  
**Author**: RAIMES Development Team
