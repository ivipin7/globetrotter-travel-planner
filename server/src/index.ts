import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/database';
import authRoutes from './routes/auth.routes';
import tripRoutes from './routes/trip.routes';
import cityRoutes from './routes/city.routes';
import itineraryRoutes from './routes/itinerary.routes';
import packingRoutes from './routes/packing.routes';
import aiRoutes from './routes/ai.routes';
import uploadRoutes from './routes/upload.routes';

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Load environment variables from server directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Test route
app.get('/api', (req, res) => {
  res.json({ 
    message: 'GlobeTrotter API is running! 🌍✈️',
    version: '1.0.0'
  });
});

// Test AI route
app.get('/api/test-ai', async (req, res) => {
  try {
    console.log('Testing AI endpoint...');
    res.json({ message: 'AI test endpoint works', geminiKey: process.env.GEMINI_API_KEY ? 'SET' : 'NOT SET' });
  } catch (error: any) {
    console.error('Test AI error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/itinerary', itineraryRoutes);
app.use('/api/packing', packingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/upload', uploadRoutes);
// app.use('/api/activities', activityRoutes);
// app.use('/api/budget', budgetRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler - Express 5 requires named parameter for wildcard
app.use('/{*splat}', (req: express.Request, res: express.Response) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌐 API URL: http://localhost:${PORT}/api`);
      console.log(`🔗 Frontend URL: ${process.env.CLIENT_URL}`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
};

startServer();
