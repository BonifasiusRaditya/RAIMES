# Logbook Coding - Responsible AI Mining Evaluation System

---

## PROJECT OVERVIEW

**Project Name:** RAIMES (Responsible AI Mining Evaluation System)  
**Version:** 1.0.0  
**Team Members:**  
- Bonifasius Raditya Pandu Hendrianto – 2306242350 – Backend and AI Engineer  
- Jonathan Frederick Kosasih – 2306225981 – Frontend Engineer  
- Adhi Rajasa Rafif - 2306266943 – AI Engineer and Project Manager  


**Course:** Rekayasa Perangkat Lunak (RPL)

**Project Description:**  
RAIMES is an AI-based evaluation system for assessing responsible mining practices. It allows mining companies to conduct self-assessments and receive AI-generated evaluations of their sustainability and compliance practices.

---

## ARCHITECTURE OVERVIEW

### **Technology Stack:**
- **Frontend:** React 19 + Vite 7 + TailwindCSS 4 + React Router DOM 7
- **Backend:** Node.js + Express 5 + TypeScript 5
- **Database:** PostgreSQL (Supabase)
- **Authentication:** JWT + bcrypt
- **AI Service:** Python (validation, evidence processing, scoring)
- **Build Tools:** tsx, typescript, eslint

### **Project Structure:**
```
RAIMES/
├── frontend/          # React Frontend Application
├── backend/           # Node.js Backend API
├── documentation/     # Project Documentation
└── database/         # Database schemas and migrations
```

---

## DEVELOPMENT LOG

### **Phase 1: Project Setup & Infrastructure**

#### **Frontend Setup**
- Initialized Vite + React 19 project
- Configured TailwindCSS 4 for styling
- Setup React Router DOM 7 for navigation
- Installed dependencies: axios, framer-motion, lucide-react
- Created basic project structure with folders: components, pages, services, context

**Code Implemented:**
- `package.json` - Project dependencies and scripts
- `vite.config.js` - Vite configuration
- `index.html` - HTML entry point
- `src/main.jsx` - React application entry point

#### **Backend Setup**
- Initialized Node.js + Express + TypeScript project
- Configured ES modules with TypeScript
- Setup development environment with tsx
- Installed core dependencies: express, cors, dotenv, pg, bcryptjs, jsonwebtoken

**Code Implemented:**
- `package.json` - Backend dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `src/app.ts` - Express server setup

---

### **Phase 2: Authentication System**

#### **Backend Authentication**
- Created JWT-based authentication middleware
- Implemented password hashing with bcrypt
- Built auth controllers for login/register
- Setup protected routes with token verification

**Code Implemented:**
```typescript
src/middleware/auth.ts       
src/controllers/authController.ts 
src/routes/authRoutes.ts     
```

**Features:**
- User registration with password hashing
- JWT token generation and validation
- Protected route middleware
- Role-based access control

#### **Frontend Authentication**
- Created AuthContext for state management
- Built ProtectedRoute component
- Implemented login/register pages
- Added token storage and management

**Code Implemented:**
```jsx
src/context/AuthContext.jsx
src/components/ProtectedRoute.jsx
src/pages/LoginPage.jsx
src/pages/RegisterPage.jsx
src/services/authService.js
```

---

### **Phase 3: Database Integration**

#### **Database Setup**
- Configured PostgreSQL connection with Supabase
- Created database connection pool
- Setup environment variables for DB config
- Implemented connection error handling

**Code Implemented:**
```typescript
src/config/database.ts
.env
```

**Database Tables Created:**
- `users` - User authentication and profiles
- `questionnaires` - Assessment templates
- `questions` - Individual assessment questions
- `responses` - User responses to questions
- `assessments` - Complete assessment records

---

### **Phase 4: Questionnaire Management System**

#### **Backend API Development**
- Created comprehensive CRUD operations for questions
- Implemented question filtering and search
- Built category and statistics endpoints
- Added validation for question types (essay/multiple choice)

**Code Implemented:**
```typescript
src/controllers/questionController.ts
src/routes/questionRoutes.ts
```

**API Endpoints:**
- `GET /api/questions` - Get all questions (protected)
- `GET /api/questions/public` - Get questions (public)
- `GET /api/questions/test` - Health check endpoint
- `POST /api/questions` - Create new question
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question
- `GET /api/questions/categories` - Get categories
- `GET /api/questions/stats` - Get statistics

#### **Frontend Question Management**
- Built EditQuestionnaire page for question management
- Implemented dynamic form for essay/multiple choice questions
- Added real-time search and filtering
- Created responsive UI with TailwindCSS

**Code Implemented:**
```jsx
src/pages/EditQuestionnaire.jsx
src/services/questionService.js
```

**Features Implemented:**
- Add new questions (essay/multiple choice)
- Edit existing questions
- Delete questions with confirmation
- Search questions by text
- Filter by category and type
- Weight assignment (1-10 scale)
- Evidence requirement toggle
- Dynamic options for multiple choice

---

### **Phase 5: CORS & Network Configuration**

#### **CORS Issues Resolution**
- Fixed CORS configuration for multiple frontend ports
- Added support for both localhost:5173 and localhost:5174
- Enhanced CORS with proper headers and methods

**Code Implemented:**
```typescript
app.use(cors({
    origin: [
        'http://localhost:5173', 
        'http://localhost:5174',
        process.env.FRONTEND_URL || 'http://localhost:5174'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**Issues Resolved:**
- Cross-Origin Request Blocked errors
- Frontend-backend communication failures
- Token authentication across domains

---

## TECHNICAL IMPLEMENTATION DETAILS

### **Database Schema Design**

#### **Question Table Structure:**
```sql
CREATE TABLE Question (
    questionID SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    type VARCHAR(20) CHECK (type IN ('essay', 'multiple_choice')),
    weight INTEGER CHECK (weight >= 1 AND weight <= 10),
    category VARCHAR(100) NOT NULL,
    require_evidence BOOLEAN DEFAULT FALSE,
    options JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Authentication Flow:**
1. User provides credentials
2. Backend validates and hashes password
3. JWT token generated with user payload
4. Frontend stores token in localStorage
5. Token attached to all subsequent requests
6. Middleware validates token on protected routes

### **Question Management Flow:**
1. Frontend loads questions via API call
2. Real-time search filters questions client-side
3. Category/type filters applied server-side
4. Form validation ensures data integrity
5. CRUD operations update database immediately
6. UI refreshes with latest data

---

## DEPLOYMENT CONSIDERATIONS

### **Environment Variables:**
```bash
# Backend .env
DATABASE_URL=postgresql://[credentials]
JWT_SECRET=[secure-secret]
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5174
```

### **Build Scripts:**
```bash
# Frontend
npm run build      # Production build
npm run dev        # Development server

# Backend
npm run build      # TypeScript compilation
npm run dev        # Development with hot reload
npm start          # Production server
```

---

## DEBUGGING & TROUBLESHOOTING LOG

### **Common Issues Encountered:**

#### **1. CORS Errors**
**Problem:** Frontend cannot access backend due to CORS policy  
**Solution:** Updated CORS configuration to support multiple origins  
**Date Fixed:** November 16, 2025

#### **2. TypeScript Module Resolution**
**Problem:** ES modules not resolving correctly  
**Solution:** Updated tsconfig.json with proper module settings  
**Status:** Resolved

#### **3. Database Connection Issues**
**Problem:** PostgreSQL connection failures  
**Solution:** Implemented proper connection pooling and error handling  
**Status:** Resolved

#### **4. Authentication Token Persistence**
**Problem:** Users logged out on page refresh  
**Solution:** Implemented localStorage token persistence  
**Status:** Resolved
