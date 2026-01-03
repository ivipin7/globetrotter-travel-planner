import express from 'express';
import { 
  register, 
  login, 
  getMe, 
  updateProfile, 
  changePassword,
  deleteAccount,
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  getStats
} from '../controllers/auth.controller';
import { authenticate, adminOnly } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (require authentication)
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);
router.delete('/account', authenticate, deleteAccount);

// Admin routes
router.get('/admin/users', authenticate, adminOnly, getAllUsers);
router.put('/admin/users/:userId/role', authenticate, adminOnly, updateUserRole);
router.put('/admin/users/:userId/toggle-status', authenticate, adminOnly, toggleUserStatus);
router.get('/admin/stats', authenticate, adminOnly, getStats);

export default router;
