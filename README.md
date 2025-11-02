# 🌟 RAIMES - Responsible AI Mining Evaluation System

![Status](https://img.shields.io/badge/status-active-success.svg)
![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)

Sistem evaluasi penerapan AI yang bertanggung jawab di industri pertambangan.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Documentation](#documentation)
- [Security](#security)
- [Contributing](#contributing)

## ✨ Features

### Backend
- ✅ RESTful API dengan Express.js & TypeScript
- ✅ Authentication menggunakan JWT
- ✅ Password hashing dengan bcrypt
- ✅ **Parameterized queries untuk mencegah SQL injection**
- ✅ PostgreSQL database
- ✅ CORS protection
- ✅ Environment variables untuk configuration
- ✅ Type-safe dengan TypeScript

### Frontend
- ✅ React dengan Vite
- ✅ Modern UI dengan TailwindCSS
- ✅ React Router untuk navigation
- ✅ Protected routes dengan authentication
- ✅ Context API untuk state management
- ✅ Axios untuk HTTP requests
- ✅ Responsive design

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **Authentication:** JWT + bcrypt
- **HTTP Client:** axios (untuk testing)

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite
- **Styling:** TailwindCSS 4
- **Routing:** React Router DOM 7
- **HTTP Client:** Axios
- **State Management:** React Context API

## 📁 Project Structure

```
RAIMES/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts          # Database configuration
│   │   ├── controllers/
│   │   │   └── authController.ts    # Authentication logic
│   │   ├── middleware/
│   │   │   └── auth.ts               # JWT middleware
│   │   ├── routes/
│   │   │   └── authRoutes.ts        # API routes
│   │   └── app.ts                    # Main application
│   ├── .env                          # Environment variables
│   ├── package.json
│   ├── tsconfig.json
│   ├── insert.sql                    # Database schema
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── QuestionnairePage.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── authService.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   ├── package.json
│   └── README.md
│
├── INTEGRATION.md                    # Integration guide
├── TESTING.md                        # Testing guide
└── README.md                         # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### 1. Clone Repository

```bash
git clone https://github.com/BonifasiusRaditya/RAIMES.git
cd RAIMES
```

### 2. Setup Database

```bash
# Create database
createdb raimes_db

# Load schema
psql -d raimes_db -f backend/insert.sql
```

### 3. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=raimes_db
# DB_USER=postgres
# DB_PASSWORD=your_password
# JWT_SECRET=your_secret_key

# Start development server
npm run dev
```

Backend will run at: **http://localhost:3000**

### 4. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

Frontend will run at: **http://localhost:5173**

### 5. Create First User

**Option A: Using API (Recommended)**
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"username":"admin","password":"admin123","email":"admin@raimes.com","role":"admin"}'
```

**Option B: Using Postman/Thunder Client**
```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123",
  "email": "admin@raimes.com",
  "role": "admin"
}
```

### 6. Login

1. Open http://localhost:5173/login
2. Enter credentials:
   - Username: `admin`
   - Password: `admin123`
3. Click "Login"
4. You'll be redirected to the dashboard!

## 📚 Documentation

### API Documentation
See [backend/README.md](backend/README.md) for detailed API documentation.

**Available Endpoints:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - Logout user

### Integration Guide
See [INTEGRATION.md](INTEGRATION.md) for frontend-backend integration details.

### Testing Guide
See [TESTING.md](TESTING.md) for comprehensive testing scenarios.

### Security Documentation
See [backend/SECURITY.md](backend/SECURITY.md) for security implementation details.

## 🔒 Security

### Implemented Security Features

#### 1. **Parameterized Queries** (SQL Injection Prevention)
```typescript
// ✅ SAFE - Using parameterized query
const query = 'SELECT * FROM "User" WHERE username = $1';
await pool.query(query, [username]);

// ❌ UNSAFE - String concatenation (NEVER DO THIS)
const query = `SELECT * FROM "User" WHERE username = '${username}'`;
```

#### 2. **Password Hashing** (bcrypt)
```typescript
// Passwords are hashed before storing
const hashedPassword = await bcrypt.hash(password, 10);
```

#### 3. **JWT Authentication**
```typescript
// Token-based authentication
const token = jwt.sign({ userID, username, role }, JWT_SECRET, { expiresIn: '24h' });
```

#### 4. **CORS Protection**
```typescript
// Only specific origin allowed
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
```

#### 5. **Environment Variables**
- Secrets stored in `.env` (not in code)
- `.env` added to `.gitignore`

### Security Best Practices

✅ **DO:**
- Use parameterized queries for ALL database operations
- Hash passwords with bcrypt (salt rounds >= 10)
- Store JWT secret in environment variables
- Validate and sanitize user input
- Use HTTPS in production
- Implement rate limiting
- Keep dependencies updated

❌ **DON'T:**
- Use string concatenation for SQL queries
- Store plain text passwords
- Hardcode secrets in code
- Expose sensitive error messages
- Trust user input without validation

## 🧪 Testing

### Quick Test

1. **Backend Health Check:**
```bash
curl http://localhost:3000/
```

2. **Frontend Access:**
Open http://localhost:5173

3. **Login Test:**
- Username: `admin`
- Password: `admin123`

For comprehensive testing, see [TESTING.md](TESTING.md)

## 🔧 Development

### Backend Development

```bash
cd backend

# Development mode (auto-reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Frontend Development

```bash
cd frontend

# Development mode (auto-reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📦 Building for Production

### Backend

```bash
cd backend
npm run build
# Output: dist/

# Start production
NODE_ENV=production npm start
```

### Frontend

```bash
cd frontend
npm run build
# Output: dist/

# Serve with any static file server
npx serve -s dist
```

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Error
```
Error: Connection refused
```
**Solution:** Make sure PostgreSQL is running and credentials in `.env` are correct.

#### CORS Error
```
Access-Control-Allow-Origin error
```
**Solution:** Check backend CORS configuration matches frontend URL.

#### Token Error
```
Invalid or expired token
```
**Solution:** Re-login to get a new token.

For more troubleshooting, see [TESTING.md](TESTING.md#-common-issues--solutions)

## 👥 User Roles

The system supports three user roles:

| Role | Description |
|------|-------------|
| **admin** | Full system access |
| **user** | Standard user access |
| **auditor** | Auditing and review access |

## 🎯 Next Steps / Roadmap

- [ ] Add password reset functionality
- [ ] Implement refresh tokens
- [ ] Add role-based access control (RBAC)
- [ ] Create company management endpoints
- [ ] Add questionnaire functionality
- [ ] Implement AI scoring system
- [ ] Add report generation
- [ ] Deploy to production

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Authors

**RAIMES Development Team**

## 🙏 Acknowledgments

- Express.js team for the excellent framework
- React team for the amazing library
- PostgreSQL community
- All contributors and testers

---

## 📞 Support

Jika ada pertanyaan atau masalah:
1. Check [TESTING.md](TESTING.md) untuk troubleshooting
2. Check [INTEGRATION.md](INTEGRATION.md) untuk integration issues
3. Check [backend/SECURITY.md](backend/SECURITY.md) untuk security concerns
4. Open an issue di GitHub repository

---

**Made with ❤️ by RAIMES Team**

**Status:** ✅ **Backend & Frontend Connected Successfully!**

- Backend API: http://localhost:3000
- Frontend App: http://localhost:5173
- Documentation: Complete
- Security: Implemented (Parameterized Queries, JWT, bcrypt)
- Testing: Ready
