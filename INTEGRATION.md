# Frontend-Backend Integration Guide

## 📋 Overview

Frontend React telah terhubung dengan Backend Node.js menggunakan:
- **Axios** untuk HTTP requests
- **JWT** untuk authentication
- **React Context** untuk state management
- **Protected Routes** untuk authorization

## 🏗️ Architecture

```
┌─────────────────┐         HTTP/HTTPS          ┌─────────────────┐
│                 │◄──────────────────────────►│                 │
│   React App     │       API Requests         │   Express API   │
│  (Port 5173)    │         + JWT              │  (Port 3000)    │
│                 │                            │                 │
└─────────────────┘                            └─────────────────┘
        │                                               │
        │                                               │
        ▼                                               ▼
  localStorage                                    PostgreSQL
  - token                                         - User table
  - user data                                     - etc.
```

## 📁 File Structure

### Frontend
```
frontend/src/
├── services/
│   ├── api.js              # Axios instance & interceptors
│   └── authService.js      # Authentication API calls
├── context/
│   └── AuthContext.jsx     # Auth state management
├── components/
│   ├── Navbar.jsx          # Navbar with user info & logout
│   └── ProtectedRoute.jsx  # Route guard component
├── pages/
│   ├── LoginPage.jsx       # Login form with API integration
│   ├── Dashboard.jsx       # Protected dashboard page
│   └── ...
├── App.jsx                 # Main app with AuthProvider
└── .env                    # Environment variables
```

## 🔗 API Service Configuration

### 1. Base API Configuration (`services/api.js`)

```javascript
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});
```

**Features:**
- ✅ Automatic token injection in headers
- ✅ Global error handling
- ✅ Auto-redirect on 401 (Unauthorized)
- ✅ Centralized API configuration

### 2. Request Interceptor

```javascript
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
```

**What it does:**
- Automatically adds JWT token to every request
- No need to manually add headers in each API call

### 3. Response Interceptor

```javascript
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear auth & redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
```

**What it does:**
- Handles 401 errors globally
- Auto-logout on expired token
- Redirects to login page

## 🔐 Authentication Service

### Auth Service Methods (`services/authService.js`)

#### 1. Login
```javascript
const response = await authService.login(username, password);
// Returns: { success, message, data: { token, user } }
```

#### 2. Register
```javascript
const response = await authService.register(username, email, password, role);
// Returns: { success, message, data: { userID, username, email, role } }
```

#### 3. Logout
```javascript
await authService.logout();
// Clears localStorage and calls backend logout endpoint
```

#### 4. Get Current User
```javascript
const user = await authService.getCurrentUser();
// Returns: user object from backend
```

#### 5. Helper Methods
```javascript
authService.isAuthenticated(); // Returns boolean
authService.getUser();         // Returns user from localStorage
authService.getToken();        // Returns JWT token
```

## 🎯 Authentication Context

### AuthContext Provider

Wraps the entire app to provide authentication state:

```jsx
<AuthProvider>
  <BrowserRouter>
    <Routes>
      {/* Your routes */}
    </Routes>
  </BrowserRouter>
</AuthProvider>
```

### useAuth Hook

Use in any component to access auth state and methods:

```jsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, loading, login, logout } = useAuth();
  
  // user: Current user object
  // isAuthenticated: Boolean
  // loading: Boolean (while checking auth state)
  // login: Function to login
  // logout: Function to logout
}
```

## 🛡️ Protected Routes

### Usage

```jsx
import ProtectedRoute from '../components/ProtectedRoute';

<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```

**Behavior:**
- ✅ Shows loading spinner while checking auth
- ✅ Redirects to `/login` if not authenticated
- ✅ Renders component if authenticated

## 📝 Login Flow

### 1. User fills login form
```jsx
// LoginPage.jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  await login(username, password);
  navigate('/dashboard');
};
```

### 2. AuthContext calls authService
```jsx
// AuthContext.jsx
const login = async (username, password) => {
  const response = await authService.login(username, password);
  setUser(response.data.user);
  setIsAuthenticated(true);
};
```

### 3. authService makes API call
```jsx
// authService.js
const response = await api.post('/auth/login', { username, password });
localStorage.setItem('token', response.data.data.token);
localStorage.setItem('user', JSON.stringify(response.data.data.user));
```

### 4. Backend verifies credentials
```typescript
// authController.ts
const user = await pool.query('SELECT * FROM "User" WHERE username = $1', [username]);
const isValid = await bcrypt.compare(password, user.password);
const token = jwt.sign({ userID, username, email, role }, JWT_SECRET);
res.json({ success: true, data: { token, user } });
```

### 5. Frontend stores token & redirects
```jsx
navigate('/dashboard');
```

## 🚀 Testing the Integration

### Step 1: Start Backend
```bash
cd backend
npm run dev
# Server running at http://localhost:3000
```

### Step 2: Start Frontend
```bash
cd frontend
npm run dev
# App running at http://localhost:5173
```

### Step 3: Test Login

1. **Register a user first:**
```bash
# Using curl or Postman
POST http://localhost:3000/api/auth/register
{
  "username": "testuser",
  "password": "password123",
  "email": "test@example.com",
  "role": "user"
}
```

2. **Login via frontend:**
   - Go to http://localhost:5173/login
   - Enter username: `testuser`
   - Enter password: `password123`
   - Click Login

3. **Expected result:**
   - ✅ Redirected to dashboard
   - ✅ Navbar shows "Hello, testuser"
   - ✅ Token saved in localStorage
   - ✅ Protected routes accessible

### Step 4: Test Protected Routes

Try accessing http://localhost:5173/dashboard directly:
- **Without token:** Redirected to `/login`
- **With valid token:** Dashboard loads
- **With expired token:** Auto-logout and redirect to `/login`

## 🔍 Debugging

### Check if token is saved
```javascript
// In browser console
localStorage.getItem('token')
localStorage.getItem('user')
```

### Check API requests
Open browser DevTools → Network tab:
- ✅ Request should have `Authorization: Bearer <token>` header
- ✅ Response should be 200 OK

### Common Issues

#### 1. CORS Error
**Error:** `Access-Control-Allow-Origin`

**Solution:** Backend CORS already configured for `http://localhost:5173`
```typescript
// backend/src/app.ts
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
```

#### 2. Token not sent
**Error:** 401 Unauthorized

**Check:**
- Token exists in localStorage?
- Interceptor adding Authorization header?
- Token not expired?

#### 3. Network Error
**Error:** `Network error`

**Check:**
- Backend server running?
- Correct API URL in `.env`?
- Firewall blocking port 3000?

## 🔒 Security Best Practices

### ✅ Implemented
- [x] JWT tokens stored in localStorage
- [x] Tokens sent via Authorization header
- [x] Automatic token cleanup on logout
- [x] Protected routes with authentication check
- [x] CORS configured for specific origin
- [x] Passwords hashed on backend
- [x] Parameterized queries prevent SQL injection

### ⚠️ Production Recommendations

1. **Use HTTPS:**
```javascript
// Only allow secure connections in production
if (process.env.NODE_ENV === 'production' && !req.secure) {
  return res.redirect('https://' + req.headers.host + req.url);
}
```

2. **Add refresh tokens:**
   - Short-lived access tokens (15 min)
   - Long-lived refresh tokens (7 days)
   - Refresh endpoint to get new access token

3. **Use httpOnly cookies (alternative to localStorage):**
```javascript
// Backend
res.cookie('token', token, {
  httpOnly: true,  // Not accessible via JavaScript
  secure: true,    // HTTPS only
  sameSite: 'strict'
});
```

4. **Add rate limiting:**
```javascript
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // 5 attempts
});

app.post('/api/auth/login', loginLimiter, login);
```

## 📊 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/logout` | Logout user | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Request Examples

#### Login
```javascript
const response = await api.post('/auth/login', {
  username: 'testuser',
  password: 'password123'
});

// Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userID": 1,
      "username": "testuser",
      "email": "test@example.com",
      "role": "user"
    }
  }
}
```

#### Get Current User
```javascript
const response = await api.get('/auth/me');

// Response:
{
  "success": true,
  "data": {
    "userid": 1,
    "username": "testuser",
    "email": "test@example.com",
    "role": "user"
  }
}
```

## 🎨 UI Features

### Login Page
- ✅ Username & password inputs
- ✅ Show/hide password toggle
- ✅ Loading state during login
- ✅ Error messages display
- ✅ Auto-redirect if already logged in

### Navbar
- ✅ Display logged-in user info
- ✅ Dropdown menu with user details
- ✅ Logout button
- ✅ Role display (admin, user, auditor)

### Dashboard
- ✅ Protected route - requires login
- ✅ Displays user-specific data
- ✅ Auto-logout on token expiration

## 🔄 State Management Flow

```
┌─────────────┐
│  Component  │
└──────┬──────┘
       │ useAuth()
       ▼
┌─────────────┐
│ AuthContext │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ authService │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  API Layer  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Backend   │
└─────────────┘
```

## 📚 Next Steps

### Adding New API Endpoints

1. **Create service method:**
```javascript
// services/companyService.js
const getCompanies = async () => {
  const response = await api.get('/companies');
  return response.data;
};
```

2. **Use in component:**
```jsx
import companyService from '../services/companyService';

const companies = await companyService.getCompanies();
```

### Adding New Protected Routes

```jsx
<Route 
  path="/new-page" 
  element={
    <ProtectedRoute>
      <NewPage />
    </ProtectedRoute>
  } 
/>
```

---

**Frontend & Backend berhasil terhubung!** 🎉

Untuk testing:
1. Backend: http://localhost:3000
2. Frontend: http://localhost:5173
3. Login dengan user yang sudah didaftarkan
