# MongoDB Backend Setup for GlobeTrotter

**Date:** January 3, 2026  
**Backend:** Node.js + Express + MongoDB + Mongoose  
**Authentication:** JWT (JSON Web Tokens)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────┐
│           React Frontend (Vite)             │
│  - TypeScript                               │
│  - TanStack Query for state management     │
│  - Axios for API calls                     │
└──────────────┬──────────────────────────────┘
               │ HTTP/REST API
               ▼
┌─────────────────────────────────────────────┐
│      Node.js + Express Backend              │
│  - Express.js (REST API)                    │
│  - JWT Authentication                       │
│  - Mongoose ODM                             │
│  - CORS enabled                             │
└──────────────┬──────────────────────────────┘
               │ Mongoose
               ▼
┌─────────────────────────────────────────────┐
│         MongoDB Database                     │
│  - MongoDB Atlas (Cloud) or Local           │
│  - Collections: users, trips, cities, etc.  │
└─────────────────────────────────────────────┘
```

---

## 📦 Required Packages

### Backend Dependencies
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.3",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "express-validator": "^7.0.1",
    "morgan": "^1.10.0",
    "multer": "^1.4.5-lts.1",
    "cloudinary": "^1.41.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/cors": "^2.8.17",
    "@types/morgan": "^1.9.9",
    "@types/multer": "^1.4.11",
    "nodemon": "^3.0.2",
    "ts-node": "^10.9.2",
    "typescript": "^5.3.3"
  }
}
```

### Frontend Additional Dependencies
```json
{
  "dependencies": {
    "axios": "^1.6.2"
  }
}
```

---

## 🗄️ MongoDB Schema Design

### 1. Users Collection
```typescript
{
  _id: ObjectId,
  fullName: string,
  email: string (unique, required),
  password: string (hashed, required),
  profilePhotoUrl?: string,
  languagePreference: string (default: 'en'),
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Trips Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User'),
  name: string (required),
  description?: string,
  coverImageUrl?: string,
  startDate: Date (required),
  endDate: Date (required),
  status: 'draft' | 'upcoming' | 'ongoing' | 'completed',
  isPublic: boolean (default: false),
  publicUrl?: string (unique),
  totalBudget?: number,
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Cities Collection (Master Data)
```typescript
{
  _id: ObjectId,
  name: string (required),
  country: string (required),
  region: string,
  latitude?: number,
  longitude?: number,
  costIndex: number (1-4),
  popularityScore?: number,
  imageUrl?: string,
  description?: string,
  tags: string[],
  createdAt: Date
}
```

### 4. Trip Stops Collection
```typescript
{
  _id: ObjectId,
  tripId: ObjectId (ref: 'Trip'),
  cityId: ObjectId (ref: 'City'),
  stopOrder: number (required),
  arrivalDate: Date (required),
  departureDate: Date (required),
  notes?: string,
  createdAt: Date,
  updatedAt: Date
}
```

### 5. Activities Collection (Master Data)
```typescript
{
  _id: ObjectId,
  cityId: ObjectId (ref: 'City'),
  name: string (required),
  description?: string,
  category: string, // 'sightseeing', 'adventure', 'food', 'culture', etc.
  durationHours?: number,
  estimatedCost?: number,
  imageUrl?: string,
  popularityScore?: number,
  tags: string[],
  createdAt: Date
}
```

### 6. Trip Activities Collection
```typescript
{
  _id: ObjectId,
  tripStopId: ObjectId (ref: 'TripStop'),
  activityId: ObjectId (ref: 'Activity'),
  scheduledDate?: Date,
  scheduledTime?: string,
  activityOrder: number,
  customCost?: number,
  notes?: string,
  createdAt: Date,
  updatedAt: Date
}
```

### 7. Budget Expenses Collection
```typescript
{
  _id: ObjectId,
  tripId: ObjectId (ref: 'Trip'),
  category: 'transport' | 'accommodation' | 'activities' | 'meals' | 'other',
  amount: number (required),
  currency: string (default: 'USD'),
  description?: string,
  date?: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 8. Saved Destinations Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User'),
  cityId: ObjectId (ref: 'City'),
  savedAt: Date
}
```

### 9. Trip Shares Collection
```typescript
{
  _id: ObjectId,
  tripId: ObjectId (ref: 'Trip'),
  sharedWithEmail: string,
  permission: 'view' | 'edit',
  createdAt: Date
}
```

---

## 🔧 Project Structure (Backend)

```
server/
├── src/
│   ├── config/
│   │   ├── database.ts          # MongoDB connection
│   │   └── cloudinary.ts        # Image upload config
│   │
│   ├── models/
│   │   ├── User.ts              # User schema
│   │   ├── Trip.ts              # Trip schema
│   │   ├── City.ts              # City schema
│   │   ├── TripStop.ts          # Trip stop schema
│   │   ├── Activity.ts          # Activity schema
│   │   ├── TripActivity.ts      # Trip activity schema
│   │   ├── BudgetExpense.ts     # Budget expense schema
│   │   ├── SavedDestination.ts  # Saved destination schema
│   │   └── TripShare.ts         # Trip share schema
│   │
│   ├── routes/
│   │   ├── auth.routes.ts       # /api/auth
│   │   ├── trip.routes.ts       # /api/trips
│   │   ├── city.routes.ts       # /api/cities
│   │   ├── activity.routes.ts   # /api/activities
│   │   ├── budget.routes.ts     # /api/budget
│   │   └── user.routes.ts       # /api/users
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── trip.controller.ts
│   │   ├── city.controller.ts
│   │   ├── activity.controller.ts
│   │   ├── budget.controller.ts
│   │   └── user.controller.ts
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts   # JWT verification
│   │   ├── validation.middleware.ts
│   │   └── error.middleware.ts
│   │
│   ├── utils/
│   │   ├── jwt.utils.ts
│   │   ├── password.utils.ts
│   │   └── validation.utils.ts
│   │
│   ├── types/
│   │   └── index.ts             # TypeScript types
│   │
│   └── index.ts                 # Entry point
│
├── .env                         # Environment variables
├── .env.example
├── package.json
├── tsconfig.json
└── nodemon.json
```

---

## 🚀 Setup Instructions

### Step 1: Create Backend Folder
```bash
# In project root
mkdir server
cd server
npm init -y
```

### Step 2: Install Dependencies
```bash
npm install express mongoose bcryptjs jsonwebtoken dotenv cors express-validator morgan multer cloudinary

npm install -D @types/express @types/bcryptjs @types/jsonwebtoken @types/cors @types/morgan @types/multer nodemon ts-node typescript
```

### Step 3: Initialize TypeScript
```bash
npx tsc --init
```

### Step 4: Create .env File
```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/globetrotter
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/globetrotter?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Cloudinary (Optional - for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:8080
```

### Step 5: MongoDB Atlas Setup (Cloud Option)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create new cluster (M0 Free Tier)
4. Create database user
5. Whitelist your IP (or 0.0.0.0/0 for development)
6. Get connection string
7. Add to .env

### Step 6: Local MongoDB Setup (Local Option)
```bash
# Install MongoDB locally
# Windows: Download from mongodb.com
# Mac: brew install mongodb-community
# Linux: sudo apt-get install mongodb

# Start MongoDB
# Windows: Run MongoDB as service
# Mac/Linux: mongod
```

---

## 📝 API Endpoints Design

### Authentication Routes (`/api/auth`)
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login user
GET    /api/auth/me                - Get current user (protected)
POST   /api/auth/logout            - Logout user
POST   /api/auth/forgot-password   - Request password reset
POST   /api/auth/reset-password    - Reset password
```

### Trip Routes (`/api/trips`)
```
GET    /api/trips                  - Get all user trips (protected)
POST   /api/trips                  - Create new trip (protected)
GET    /api/trips/:id              - Get trip by ID (protected)
PUT    /api/trips/:id              - Update trip (protected)
DELETE /api/trips/:id              - Delete trip (protected)
GET    /api/trips/public/:url      - Get public trip (public)
POST   /api/trips/:id/share        - Share trip (protected)
```

### Trip Stops Routes (`/api/trips/:tripId/stops`)
```
GET    /api/trips/:tripId/stops           - Get all stops for trip
POST   /api/trips/:tripId/stops           - Add stop to trip
PUT    /api/trips/:tripId/stops/:stopId   - Update stop
DELETE /api/trips/:tripId/stops/:stopId   - Delete stop
PUT    /api/trips/:tripId/stops/reorder   - Reorder stops
```

### Trip Activities Routes (`/api/trips/:tripId/activities`)
```
GET    /api/trips/:tripId/activities            - Get all activities
POST   /api/trips/:tripId/stops/:stopId/activities  - Add activity
PUT    /api/trips/:tripId/activities/:activityId    - Update activity
DELETE /api/trips/:tripId/activities/:activityId    - Delete activity
```

### City Routes (`/api/cities`)
```
GET    /api/cities                 - Get all cities (with filters)
GET    /api/cities/:id             - Get city by ID
GET    /api/cities/search          - Search cities
POST   /api/cities                 - Create city (admin only)
```

### Activity Routes (`/api/activities`)
```
GET    /api/activities             - Get all activities (filtered by city)
GET    /api/activities/:id         - Get activity by ID
POST   /api/activities             - Create activity (admin only)
```

### Budget Routes (`/api/budget`)
```
GET    /api/budget/trip/:tripId    - Get budget summary for trip
POST   /api/budget/expense         - Add expense
PUT    /api/budget/expense/:id     - Update expense
DELETE /api/budget/expense/:id     - Delete expense
```

### User Routes (`/api/users`)
```
GET    /api/users/profile          - Get user profile (protected)
PUT    /api/users/profile          - Update profile (protected)
POST   /api/users/avatar           - Upload profile photo (protected)
GET    /api/users/saved-destinations   - Get saved destinations
POST   /api/users/saved-destinations   - Save destination
DELETE /api/users/saved-destinations/:id - Remove saved destination
```

---

## 🔐 Authentication Flow

### Registration
```
1. User submits: { fullName, email, password }
2. Backend validates input
3. Check if email exists
4. Hash password with bcrypt
5. Create user in database
6. Generate JWT token
7. Return user data + token
```

### Login
```
1. User submits: { email, password }
2. Backend validates input
3. Find user by email
4. Compare password with bcrypt
5. Generate JWT token
6. Return user data + token
```

### Protected Routes
```
1. Frontend sends token in header: Authorization: Bearer <token>
2. Backend middleware verifies JWT
3. Decode user ID from token
4. Attach user to request object
5. Continue to route handler
```

---

## 🎯 Frontend Integration

### Create API Client
```typescript
// src/lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
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

### Update .env in Frontend
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📊 Sample Data Seeding

### Seed Script for Cities
```typescript
// server/src/seeds/cities.seed.ts
const cities = [
  {
    name: "Tokyo",
    country: "Japan",
    region: "Asia",
    costIndex: 3,
    popularityScore: 95,
    imageUrl: "https://images.unsplash.com/...",
    tags: ["culture", "food", "modern"]
  },
  // ... more cities
];

// Run: npm run seed
```

---

## ⚡ Quick Start Commands

### Backend
```json
{
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "seed": "ts-node src/seeds/index.ts"
  }
}
```

### Start Development
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd ..
npm run dev
```

---

## 🔒 Security Best Practices

1. **Password Hashing:** Use bcrypt with salt rounds >= 10
2. **JWT Secret:** Use strong, random secret (32+ characters)
3. **CORS:** Only allow your frontend origin
4. **Input Validation:** Validate all inputs with express-validator
5. **Rate Limiting:** Add express-rate-limit to prevent abuse
6. **Helmet:** Use helmet middleware for security headers
7. **Environment Variables:** Never commit .env file
8. **HTTPS:** Use HTTPS in production
9. **MongoDB Injection:** Use Mongoose (parameterized queries)
10. **File Uploads:** Validate file types and sizes

---

## 📈 Next Steps

1. ✅ Set up MongoDB Atlas or local MongoDB
2. ✅ Create backend folder structure
3. ✅ Implement User model and authentication
4. ✅ Create Trip CRUD operations
5. ✅ Implement trip stops and activities
6. ✅ Add budget tracking
7. ✅ Test all API endpoints
8. ✅ Connect frontend to backend
9. ✅ Deploy backend (Render, Railway, or Heroku)
10. ✅ Deploy frontend (Vercel)

---

## 🚀 Deployment

### Backend Deployment (Render.com)
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repo
4. Set environment variables
5. Deploy!

### MongoDB Atlas (Production)
- Already cloud-hosted
- Just use production connection string

### Frontend Deployment (Vercel)
1. Push code to GitHub
2. Import project to Vercel
3. Set VITE_API_URL to production backend URL
4. Deploy!

---

*Ready to start building! Let's create the backend first.*
