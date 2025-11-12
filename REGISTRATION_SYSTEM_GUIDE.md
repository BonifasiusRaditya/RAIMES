# Registration Request System - Implementation Guide

## 📋 Overview
Sistem Registration Request memungkinkan user dan auditor untuk mengajukan permintaan akun yang harus di-approve oleh admin sebelum dapat login.

## 🗄️ Database
Table `RegistrationRequest` sudah dibuat di Supabase dengan struktur:
- `requestid` - Primary key
- `username`, `email`, `password` (hashed)
- `role` ('user' atau 'auditor')
- `companyname`, `address` (untuk role 'user')
- `status` ('pending', 'approved', 'rejected')
- `rejection_reason`
- `requested_at`, `reviewed_at`, `reviewed_by`

## 🔄 Alur Kerja

### 1. **User/Auditor Register** →  `/register-request`
- User mengisi form registrasi
- Data disimpan ke table `RegistrationRequest` dengan status 'pending'
- Redirect ke halaman `/registration-pending`

### 2. **Admin Review** → Dashboard Admin
- Admin melihat list registration requests
- Filter by status: pending, approved, rejected, all
- Stats dashboard menampilkan jumlah per status

### 3a. **APPROVE** 
- Admin klik "Approve"
- Sistem membuat akun di table `User`
- Jika role='user', buat record di table `Company`
- Status request diupdate jadi 'approved'
- User bisa login dengan kredensial yang didaftarkan

### 3b. **REJECT**
- Admin klik "Reject"
- Admin wajib isi rejection reason
- Status request diupdate jadi 'rejected'
- User tidak bisa login

## 📁 Files yang Dibuat

### Backend

#### 1. **Controller**
```
backend/src/controllers/registrationController.ts
```
Functions:
- `createRegistrationRequest` - POST /api/auth/register-request
- `getAllRegistrationRequests` - GET /api/admin/registration-requests
- `getRegistrationRequestStats` - GET /api/admin/registration-requests/stats
- `approveRegistrationRequest` - POST /api/admin/registration-requests/:id/approve
- `rejectRegistrationRequest` - POST /api/admin/registration-requests/:id/reject
- `checkRegistrationStatus` - GET /api/auth/check-registration-status/:email

#### 2. **Routes**
```
backend/src/routes/registrationRoutes.ts
```
Public routes:
- POST `/api/auth/register-request`
- GET `/api/auth/check-registration-status/:email`

Admin routes (requires authentication):
- GET `/api/admin/registration-requests`
- GET `/api/admin/registration-requests/stats`
- POST `/api/admin/registration-requests/:id/approve`
- POST `/api/admin/registration-requests/:id/reject`

#### 3. **App.ts** (Updated)
Added routes:
```typescript
app.use('/api/auth', registrationRoutes);
app.use('/api/admin', registrationRoutes);
```

### Frontend

#### 1. **Pages**
```
frontend/src/pages/RegisterRequestPage.jsx
frontend/src/pages/RegistrationPendingPage.jsx
```

#### 2. **Components**
```
frontend/src/components/RegistrationRequestsManagement.jsx
```
Component untuk admin dashboard mengelola registration requests

#### 3. **App.jsx** (Updated)
Added routes:
```jsx
<Route path="/register-request" element={<RegisterRequestPage />} />
<Route path="/registration-pending" element={<RegistrationPendingPage />} />
```

#### 4. **RegisterPage.jsx** (Updated)
Sekarang redirect otomatis ke `/register-request`

## 🚀 Cara Menggunakan

### For Users/Auditors:

1. **Buka halaman registrasi**: `/register-request`
2. **Isi form**:
   - Username
   - Email
   - Password & Confirm Password
   - Role (User/Company atau Auditor)
   - Company Name (jika role = user)
   - Company Address (optional, jika role = user)
3. **Submit** → Redirect ke `/registration-pending`
4. **Tunggu approval** dari admin
5. **Jika approved** → Bisa login dengan email & password yang didaftarkan

### For Admin:

1. **Login** sebagai admin
2. **Dashboard** → Lihat "Registration Requests" section (perlu ditambahkan ke Dashboard)
3. **Review requests**:
   - Lihat detail user (username, email, role, company)
   - Klik **"Approve"** untuk menerima
   - Klik **"Reject"** untuk menolak (wajib isi reason)
4. **Filter** berdasarkan status (pending/approved/rejected/all)

## 🔗 Integrasi dengan Dashboard Admin

### Tambahkan ke Dashboard.jsx

```jsx
import RegistrationRequestsManagement from '../components/RegistrationRequestsManagement';

// Di dalam Dashboard component
<div className="tab-content">
  {activeTab === 'registration-requests' && (
    <RegistrationRequestsManagement />
  )}
</div>
```

### Tambahkan Tab Menu
```jsx
<button
  onClick={() => setActiveTab('registration-requests')}
  className={`tab-button ${activeTab === 'registration-requests' ? 'active' : ''}`}
>
  Registration Requests
  {stats.pending > 0 && (
    <span className="badge">{stats.pending}</span>
  )}
</button>
```

## 🧪 Testing

### 1. Test User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register-request \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "role": "user",
    "companyname": "Test Company",
    "address": "Test Address"
  }'
```

### 2. Test Get All Requests (Admin)
```bash
curl -X GET http://localhost:5000/api/admin/registration-requests \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 3. Test Approve Request (Admin)
```bash
curl -X POST http://localhost:5000/api/admin/registration-requests/1/approve \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

### 4. Test Reject Request (Admin)
```bash
curl -X POST http://localhost:5000/api/admin/registration-requests/1/reject \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Invalid company information"}'
```

## ✅ Checklist Implementation

Backend:
- [x] Create RegistrationRequest table di Supabase
- [x] Create registrationController.ts
- [x] Create registrationRoutes.ts
- [x] Update app.ts dengan routes baru
- [x] Add authentication middleware untuk admin routes

Frontend:
- [x] Create RegisterRequestPage.jsx
- [x] Create RegistrationPendingPage.jsx
- [x] Create RegistrationRequestsManagement.jsx component
- [x] Update App.jsx routing
- [x] Update RegisterPage.jsx redirect
- [ ] **TODO: Integrate RegistrationRequestsManagement ke Dashboard admin**

## 📝 Next Steps

1. **Test backend endpoints** dengan Postman/Thunder Client
2. **Test frontend flow** dari register sampai approval
3. **Integrate RegistrationRequestsManagement** component ke Admin Dashboard
4. **Optional**: Add email notifications ketika request di-approve/reject
5. **Optional**: Add "Check Status" page untuk user cek status registrasi mereka

## 🔐 Security Notes

- Password di-hash menggunakan bcryptjs sebelum disimpan
- Admin routes dilindungi dengan `authenticateToken` middleware
- Validation di backend dan frontend
- Check duplicate email/username di User table dan RegistrationRequest table

## 🐛 Troubleshooting

### Error: "Email already registered"
→ Email sudah ada di table User. User sudah punya akun aktif.

### Error: "You already have a pending registration request"
→ Email sudah submit request yang masih pending. Tunggu admin review.

### Error: "Rejection reason is required"
→ Admin harus isi alasan reject sebelum reject request.

### 404 on /api/admin/registration-requests
→ Pastikan sudah login sebagai admin dan token valid.

## 📧 Contact
Untuk pertanyaan atau bantuan, hubungi tim development.
