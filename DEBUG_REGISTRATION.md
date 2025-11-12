# 🔍 Debug Registration Request - Checklist

## Step 1: Check Backend Server

1. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Check Console Output**
   - ✅ Should see: `🚀 Server berjalan di http://localhost:3000`
   - ❌ If error, check:
     - Database connection (DATABASE_URL in .env)
     - Port already in use
     - Missing dependencies (run `npm install`)

3. **Test Backend API Directly**
   ```bash
   node test-register.js
   ```

---

## Step 2: Check Browser Console (F12)

1. **Open Developer Tools** (Press F12)

2. **Go to Console Tab**
   - Look for JavaScript errors
   - Look for network errors

3. **Go to Network Tab**
   - Filter by "Fetch/XHR"
   - Find request to `/api/auth/register-request`
   - Check:
     - **Status Code**: Should be 201 (Created) or 4xx/5xx (Error)
     - **Request Payload**: Check if data is sent correctly
     - **Response**: Check error message

---

## Step 3: Common Errors & Solutions

### Error: "Network Error" / "Failed to fetch"
**Cause**: Backend not running or wrong URL
**Solution**: 
1. Make sure backend is running on port 3000
2. Check `frontend/src/services/api.js` - base URL should be `http://localhost:3000/api`

### Error: "CORS Error"
**Cause**: Frontend URL not allowed by backend
**Solution**: Check `backend/src/app.ts` CORS settings:
```typescript
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
}));
```

### Error: "Email already registered"
**Cause**: Email already exists in User table or has pending request
**Solution**: Use different email or check database

### Error: "Username already taken"
**Cause**: Username already exists
**Solution**: Use different username

### Error: "Database connection error"
**Cause**: Can't connect to Supabase
**Solution**: 
1. Check `backend/.env` file
2. Verify DATABASE_URL is correct
3. Check internet connection

### Error: "Password hash error"
**Cause**: bcryptjs not installed
**Solution**: 
```bash
cd backend
npm install bcryptjs @types/bcryptjs
```

---

## Step 4: Check Database

1. **Go to Supabase Dashboard**
2. **Check Table**: `RegistrationRequest`
3. **Verify**:
   - Table exists
   - Columns match the schema
   - No duplicate emails in pending status

---

## Step 5: Test with Different Data

Try registering with:
- **Different email**: Use unique email each time
- **Different username**: Use unique username
- **Role = auditor**: Test without company fields

---

## Step 6: Check Backend Logs

Look for these messages in backend console:
```
POST /api/auth/register-request
Error creating registration request: [ERROR DETAILS]
```

---

## Quick Test Commands

### Test backend is running:
```bash
curl http://localhost:3000/api/status
```

### Test registration endpoint:
```bash
curl -X POST http://localhost:3000/api/auth/register-request \
  -H "Content-Type: application/json" \
  -d '{
    "username": "quicktest",
    "email": "quicktest@test.com",
    "password": "test123",
    "role": "user",
    "companyname": "Quick Test Co",
    "address": "Test Address"
  }'
```

---

## If Still Not Working

**Share with me:**
1. Backend console output (copy all errors)
2. Browser console errors (F12 → Console tab)
3. Network tab response (F12 → Network tab → Click failed request → Response)
4. Screenshot of the error

**I'll help you fix it!** 🚀
