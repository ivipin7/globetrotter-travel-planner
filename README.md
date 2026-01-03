# GlobeTrotter - Travel Planning Platform

## About

**GlobeTrotter** is a personalized, intelligent travel planning platform that empowers users to dream, design, and organize trips with ease. Create stunning itineraries, manage budgets, discover destinations, and share your travel plans.

## Features

- 🗺️ **Multi-City Itinerary Planning** - Plan trips across multiple destinations
- 💰 **Budget Tracking** - Real-time cost breakdown and budget management
- 🌍 **Destination Discovery** - Explore cities and activities worldwide
- 📅 **Visual Timeline** - Calendar view of your entire journey
- 🤝 **Trip Sharing** - Share plans with friends or make them public
- 📱 **Mobile Responsive** - Beautiful design on all devices

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **UI**: Tailwind CSS, Shadcn UI, Radix UI
- **Authentication**: JWT (JSON Web Tokens)
- **State Management**: TanStack Query
- **Forms**: React Hook Form + Zod validation

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or MongoDB Atlas)

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd globetrotter

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Environment Setup

1. **Backend Environment** - Create `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/globetrotter
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:8080
```

2. **Frontend Environment** - Create `.env.local`:
```env
VITE_API_URL=http://localhost:5000/api
```

### Running the Application

```bash
# Terminal 1 - Start Backend
cd server
npm run dev

# Terminal 2 - Start Frontend  
npm run dev
```

The application will be available at:
- Frontend: http://localhost:8080
- Backend API: http://localhost:5000/api

## Project Structure

```
globetrotter/
├── src/                    # Frontend source
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── services/          # API services
│   └── lib/               # Utilities
├── server/                # Backend source
│   └── src/
│       ├── models/        # MongoDB models
│       ├── routes/        # API routes
│       ├── controllers/   # Route controllers
│       └── middleware/    # Express middleware
└── public/                # Static assets
```

## Development

### Build for Production

```bash
# Build frontend
npm run build

# Build backend
cd server
npm run build
```

### Deployment

**Frontend**: Deploy to Vercel, Netlify, or any static hosting
**Backend**: Deploy to Render, Railway, Heroku, or similar Node.js hosting
**Database**: MongoDB Atlas (cloud) recommended for production

## Contributing

This is a hackathon project. Contributions, issues, and feature requests are welcome!

## License

MIT

## Acknowledgments

Built for [Hackathon Name] 2026

---

**GlobeTrotter** - Plan your perfect trip with confidence 🌍✈️
