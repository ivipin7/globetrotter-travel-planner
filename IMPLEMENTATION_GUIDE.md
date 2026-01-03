# 🚀 GlobeTrotter Backend - Implementation Guide

## ✅ What We've Done So Far

### 1. Backend Structure Created ✅
- ✅ Created `/server` directory
- ✅ Initialized npm project
- ✅ Installed all dependencies
- ✅ Created TypeScript configuration
- ✅ Created environment files (.env)
- ✅ Created nodemon configuration

### 2. Files Created ✅
- ✅ `src/index.ts` - Main server entry point
- ✅ `src/config/database.ts` - MongoDB connection
- ✅ `src/models/User.ts` - User model with bcrypt
- ✅ `src/models/Trip.ts` - Trip model
- ✅ `src/models/City.ts` - City model
- ✅ `src/utils/jwt.utils.ts` - JWT utilities
- ✅ `src/middleware/auth.middleware.ts` - Authentication middleware

---

## 📋 Next Steps - Continue Implementation

### Step 1: Create Authentication Controller (15 mins)

Create file: `server/src/controllers/auth.controller.ts`

```typescript
import { Request, Response } from 'express';
import User from '../models/User';
import { generateToken } from '../utils/jwt.utils';

// Register new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'Email already registered' });
      return;
    }

    // Create new user
    const user = new User({
      fullName,
      email,
      password // Will be hashed by pre-save hook
    });

    await user.save();

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePhotoUrl: user.profilePhotoUrl
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user (include password field)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePhotoUrl: user.profilePhotoUrl
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// Get current user
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePhotoUrl: user.profilePhotoUrl,
        languagePreference: user.languagePreference
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to get user', error: error.message });
  }
};
```

### Step 2: Create Auth Routes (10 mins)

Create file: `server/src/routes/auth.routes.ts`

```typescript
import express from 'express';
import { register, login, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authenticate, getMe);

export default router;
```

### Step 3: Update Main Server File (5 mins)

Update `server/src/index.ts` - Add this after the middleware section:

```typescript
// Import routes
import authRoutes from './routes/auth.routes';

// Use routes
app.use('/api/auth', authRoutes);
```

### Step 4: Start MongoDB (if not already running)

**Option A: Local MongoDB**
```bash
# Windows: MongoDB should be running as a service
# Check in Services (services.msc)

# Or start manually:
mongod
```

**Option B: MongoDB Atlas (Cloud - Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create M0 Free Cluster
4. Create database user
5. Whitelist IP: 0.0.0.0/0 (for development)
6. Get connection string
7. Update `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/globetrotter?retryWrites=true&w=majority
```

### Step 5: Start Backend Server

```bash
cd server
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
📊 Database: globetrotter
✅ Server running on port 5000
🌐 API URL: http://localhost:5000/api
```

### Step 6: Test Authentication API

**Test Registration:**
```bash
# Using PowerShell
$body = @{
    fullName = "John Doe"
    email = "john@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/auth/register" `
    -ContentType "application/json" -Body $body
```

**Or use Postman/Thunder Client:**
- Method: POST
- URL: http://localhost:5000/api/auth/register
- Body (JSON):
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

---

## 📝 Remaining Tasks

### Phase 1: Complete Core Backend (6-8 hours)

#### 1.1 Trip Management (2 hours)
- [ ] Create Trip controller
- [ ] Create Trip routes
- [ ] Implement CRUD operations

#### 1.2 Trip Stops (1.5 hours)
- [ ] Create TripStop model
- [ ] Create TripStop controller
- [ ] Create routes for adding/removing stops

#### 1.3 Activities (1.5 hours)
- [ ] Create Activity model
- [ ] Create TripActivity model
- [ ] Create controllers and routes

#### 1.4 Budget (1 hour)
- [ ] Create BudgetExpense model
- [ ] Create budget controller
- [ ] Implement budget calculations

#### 1.5 Cities & Search (1 hour)
- [ ] Create City controller
- [ ] Implement search and filters
- [ ] Seed initial city data

#### 1.6 Seed Database (1 hour)
- [ ] Create seed script
- [ ] Add sample cities
- [ ] Add sample activities

---

## 🔗 Frontend Integration

### Step 1: Install Axios in Frontend
```bash
# In root directory (not server)
npm install axios
```

### Step 2: Create API Client

Create file: `src/lib/api.ts`

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Step 3: Create Auth Service

Create file: `src/services/authService.ts`

```typescript
import api from '@/lib/api';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    profilePhotoUrl?: string;
  };
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data.user;
  },

  logout() {
    localStorage.removeItem('token');
  }
};
```

### Step 4: Create Auth Context

Create file: `src/contexts/AuthContext.tsx`

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/authService';

interface User {
  id: string;
  fullName: string;
  email: string;
  profilePhotoUrl?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const userData = await authService.getMe();
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    const { token, user: userData } = await authService.login({ email, password });
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const register = async (fullName: string, email: string, password: string) => {
    const { token, user: userData } = await authService.register({ fullName, email, password });
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Step 5: Update App.tsx

Wrap your app with AuthProvider:

```typescript
import { AuthProvider } from './contexts/AuthContext';

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {/* ... routes ... */}
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);
```

### Step 6: Update Login Page

Update `src/pages/Login.tsx` to use real authentication:

```typescript
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Inside component:
const { login } = useAuth();
const navigate = useNavigate();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  
  try {
    await login(email, password);
    toast.success('Login successful!');
    navigate('/dashboard');
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Login failed');
  } finally {
    setIsLoading(false);
  }
};
```

### Step 7: Create .env for Frontend

Create/Update `.env.local` in root:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🎯 Testing Checklist

### Backend Tests
- [ ] Server starts without errors
- [ ] MongoDB connects successfully
- [ ] `/api` endpoint returns success
- [ ] Register endpoint creates user
- [ ] Login endpoint returns token
- [ ] Protected routes require authentication
- [ ] JWT tokens work correctly

### Frontend Tests
- [ ] Login form submits to backend
- [ ] Successful login redirects to dashboard
- [ ] Token stored in localStorage
- [ ] Protected routes check authentication
- [ ] Logout clears token

---

## 📚 Useful Commands

```bash
# Backend
cd server
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server

# Frontend
npm run dev          # Start development server

# MongoDB
mongosh              # MongoDB shell (if installed locally)
show dbs             # List databases
use globetrotter     # Switch to database
show collections     # List collections
db.users.find()      # View users
```

---

## 🐛 Common Issues & Solutions

### Issue: MongoDB Connection Failed
**Solution:** 
- Check MongoDB is running: `mongod --version`
- Check connection string in `.env`
- For Atlas: Verify IP whitelist and credentials

### Issue: Port 5000 already in use
**Solution:**
```bash
# Find process using port 5000
netstat -ano | findstr :5000
# Kill process
taskkill /PID <process_id> /F
```

### Issue: CORS errors
**Solution:** Verify `CLIENT_URL` in backend `.env` matches your frontend URL

### Issue: Token not working
**Solution:** Check JWT_SECRET is set in backend `.env`

---

## 🎉 You're Ready!

With authentication working, you can now:
1. ✅ Register users
2. ✅ Login users
3. ✅ Protect routes
4. ✅ Get user data

Next: Implement Trip CRUD operations following the same pattern!

---

*Continue with the remaining models and controllers using the authentication pattern as a template.*
