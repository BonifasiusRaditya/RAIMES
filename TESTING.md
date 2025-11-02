# 🧪 Testing Guide - RAIMES Application

## 📋 Prerequisites

Before testing, make sure:
- ✅ PostgreSQL database is running
- ✅ Database `raimes_db` has been created
- ✅ Schema has been loaded (`insert.sql`)
- ✅ Backend dependencies installed (`npm install`)
- ✅ Frontend dependencies installed (`npm install`)

## 🚀 Starting the Application

### Terminal 1: Start Backend
```bash
cd backend
npm run dev
```

**Expected output:**
```
✅ Database connected successfully
🚀 Server berjalan di http://localhost:3000
📝 Environment: development
```

### Terminal 2: Start Frontend
```bash
cd frontend
npm run dev
```

**Expected output:**
```
VITE v7.1.11  ready in 863 ms
➜  Local:   http://localhost:5173/
```

## 🔐 Test Scenario 1: User Registration

### Step 1: Register via API
Open Postman, Thunder Client, or use curl:

```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"username":"testuser","password":"password123","email":"test@example.com","role":"user"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userID": 1,
    "username": "testuser",
    "email": "test@example.com",
    "role": "user"
  }
}
```

### Step 2: Verify in Database
```bash
psql -d raimes_db
```

```sql
SELECT * FROM "User";
```

**Expected Result:**
```
userid | username | email              | role | password (hashed)
-------+----------+--------------------+------+-------------------
1      | testuser | test@example.com   | user | $2a$10$...
```

✅ **Test Passed:** User created with hashed password

## 🔑 Test Scenario 2: Login via Frontend

### Step 1: Open Frontend
Navigate to: http://localhost:5173

### Step 2: Should Redirect to Dashboard
- Since no user is logged in, should redirect to `/login`

### Step 3: Login
1. Enter username: `testuser`
2. Enter password: `password123`
3. Click "Login"

### Step 4: Verify Success
✅ Should redirect to `/dashboard`
✅ Navbar shows: "Hello, testuser"
✅ User role displayed: "user"

### Step 5: Check Browser Storage
Open DevTools (F12) → Application/Storage → Local Storage:

```javascript
token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
user: '{"userID":1,"username":"testuser","email":"test@example.com","role":"user"}'
```

✅ **Test Passed:** Login successful with token stored

## 🚫 Test Scenario 3: Invalid Login

### Step 1: Logout
Click user dropdown → Logout

### Step 2: Try Invalid Credentials
1. Username: `testuser`
2. Password: `wrongpassword`
3. Click "Login"

### Expected Result:
❌ Error message: "Invalid username or password"
❌ Should NOT redirect
❌ Token should NOT be saved

✅ **Test Passed:** Invalid credentials rejected

## 🔒 Test Scenario 4: Protected Routes

### Step 1: Clear Storage (Logout)
1. Open DevTools (F12)
2. Application → Local Storage
3. Delete `token` and `user`

### Step 2: Try Accessing Dashboard
Navigate to: http://localhost:5173/dashboard

### Expected Result:
✅ Auto-redirect to `/login`
✅ Cannot access protected route without token

### Step 3: Login Again
Use valid credentials → Should access dashboard

✅ **Test Passed:** Protected routes working

## 🔄 Test Scenario 5: Token Persistence

### Step 1: Login
Login with valid credentials

### Step 2: Refresh Page
Press F5 or Ctrl+R

### Expected Result:
✅ User still logged in
✅ No redirect to login page
✅ Navbar still shows user info

### Step 3: Close & Reopen Browser
Close browser → Open again → Navigate to http://localhost:5173

### Expected Result:
✅ User still logged in (token persists)
✅ Dashboard accessible

✅ **Test Passed:** Token persistence working

## 🛡️ Test Scenario 6: SQL Injection Prevention

### Test with Malicious Input

Try logging in with:
- Username: `admin' OR '1'='1`
- Password: `anything`

### Expected Result:
❌ Login fails with "Invalid username or password"
✅ No SQL injection occurs

### Verify in Backend Logs
Should see parameterized query:
```typescript
SELECT * FROM "User" WHERE username = $1
// Parameter: ["admin' OR '1'='1"]
```

✅ **Test Passed:** SQL injection prevented

## 🔐 Test Scenario 7: Password Security

### Step 1: Check Database
```sql
SELECT username, password FROM "User" WHERE username = 'testuser';
```

### Expected Result:
```
username | password
---------+--------------------------------------------------------------
testuser | $2a$10$YourBcryptHashHere...
```

✅ Password is hashed (starts with `$2a$10$`)
✅ NOT plain text

### Step 2: Try Comparing Passwords
Even if two users have same password, hashes should be different:

```bash
# Register another user with same password
POST /api/auth/register
{
  "username": "user2",
  "password": "password123",
  "email": "user2@example.com",
  "role": "user"
}
```

```sql
SELECT username, password FROM "User";
```

**Expected Result:**
```
testuser | $2a$10$hash1...  ← Different hash
user2    | $2a$10$hash2...  ← Different hash
```

✅ **Test Passed:** Each password has unique hash (salt)

## 📊 Test Scenario 8: API Endpoints

### Test All Endpoints

#### 1. Health Check
```bash
curl http://localhost:3000/
```

**Expected:**
```json
{
  "message": "RAIMES Backend API",
  "version": "1.0.0",
  "status": "running"
}
```

#### 2. Status Check
```bash
curl http://localhost:3000/api/status
```

**Expected:**
```json
{
  "status": "OK",
  "environment": "development",
  "timestamp": "2024-11-02T..."
}
```

#### 3. Register (duplicate username)
```bash
POST /api/auth/register
{
  "username": "testuser",  // Already exists
  "password": "password123",
  "email": "new@example.com",
  "role": "user"
}
```

**Expected:**
```json
{
  "success": false,
  "message": "Username or email already exists"
}
```

#### 4. Get Current User (with token)
```bash
GET /api/auth/me
Authorization: Bearer <your-token>
```

**Expected:**
```json
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

#### 5. Get Current User (without token)
```bash
GET /api/auth/me
# No Authorization header
```

**Expected:**
```json
{
  "success": false,
  "message": "Access token required"
}
```

✅ **Test Passed:** All endpoints working correctly

## 🎭 Test Scenario 9: Different User Roles

### Register Users with Different Roles

#### Admin User
```bash
POST /api/auth/register
{
  "username": "admin",
  "password": "admin123",
  "email": "admin@raimes.com",
  "role": "admin"
}
```

#### Auditor User
```bash
POST /api/auth/register
{
  "username": "auditor1",
  "password": "auditor123",
  "email": "auditor@raimes.com",
  "role": "auditor"
}
```

### Test Login with Each Role

1. Login as `admin` → Check navbar shows "Admin"
2. Login as `auditor1` → Check navbar shows "Auditor"
3. Login as `testuser` → Check navbar shows "User"

✅ **Test Passed:** Role-based authentication working

## 🌐 Test Scenario 10: CORS

### Try Accessing from Different Origin

Open browser console on any other website and try:

```javascript
fetch('http://localhost:3000/api/status', {
  method: 'GET',
  credentials: 'include'
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));
```

### Expected Result:
❌ CORS error (if not from localhost:5173)
✅ Only allowed origin can access API

✅ **Test Passed:** CORS protection working

## 📱 Test Scenario 11: UI Features

### Login Page
- ✅ Email/Username input validation
- ✅ Password show/hide toggle works
- ✅ Loading spinner during login
- ✅ Error messages display correctly
- ✅ Remember me checkbox (visual only)

### Dashboard
- ✅ Protected route check
- ✅ Data displays correctly
- ✅ No console errors

### Navbar
- ✅ User info displays
- ✅ Dropdown menu opens/closes
- ✅ Logout button works
- ✅ User role displays correctly

✅ **Test Passed:** UI working as expected

## 🐛 Common Issues & Solutions

### Issue 1: Cannot connect to database
**Error:** `Connection refused`

**Solution:**
```bash
# Check if PostgreSQL is running
psql --version

# Start PostgreSQL service
# Windows:
net start postgresql-x64-12

# Check connection
psql -U postgres -d raimes_db
```

### Issue 2: CORS error
**Error:** `Access-Control-Allow-Origin`

**Solution:**
Check backend CORS configuration:
```typescript
// backend/src/app.ts
app.use(cors({
    origin: 'http://localhost:5173',  // ← Must match frontend URL
    credentials: true
}));
```

### Issue 3: Token not found
**Error:** `Access token required`

**Solution:**
1. Check if token exists: `localStorage.getItem('token')`
2. Re-login if token expired
3. Check API interceptor is adding header

### Issue 4: Backend not starting
**Error:** `Unknown file extension .ts`

**Solution:**
```bash
# Make sure tsx is installed
npm install -D tsx

# Check package.json scripts
"dev": "tsx watch src/app.ts"
```

## ✅ Test Checklist

### Backend Tests
- [ ] Database connection successful
- [ ] User registration works
- [ ] Password is hashed in database
- [ ] Login with valid credentials works
- [ ] Login with invalid credentials fails
- [ ] JWT token is generated
- [ ] Protected endpoints require token
- [ ] SQL injection prevented
- [ ] All API endpoints return correct responses

### Frontend Tests
- [ ] Login page loads
- [ ] Login form submits correctly
- [ ] Error messages display
- [ ] Token saved in localStorage
- [ ] Redirect to dashboard on success
- [ ] Protected routes require authentication
- [ ] Navbar shows user info
- [ ] Logout clears token and redirects
- [ ] Token persists on page refresh
- [ ] Auto-logout on expired token

### Integration Tests
- [ ] Frontend connects to backend API
- [ ] CORS allows frontend origin
- [ ] Token sent with API requests
- [ ] Auth state syncs across tabs
- [ ] Network errors handled gracefully

## 📊 Test Results Template

```
=== RAIMES Testing Results ===
Date: ___________
Tester: ___________

Backend Tests:
[ ] Registration: ___________
[ ] Login: ___________
[ ] Protected Routes: ___________
[ ] SQL Injection Prevention: ___________
[ ] Password Hashing: ___________

Frontend Tests:
[ ] Login Page: ___________
[ ] Dashboard: ___________
[ ] Protected Routes: ___________
[ ] Token Persistence: ___________
[ ] Logout: ___________

Integration Tests:
[ ] API Connection: ___________
[ ] CORS: ___________
[ ] Error Handling: ___________

Overall Status: [ ] PASS / [ ] FAIL

Notes:
___________________________
___________________________
```

---

**Happy Testing!** 🧪✅

Jika menemui masalah, check:
1. Console logs (Frontend & Backend)
2. Network tab in DevTools
3. Database untuk verify data
4. Environment variables di `.env`
