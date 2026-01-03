import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../middleware/auth.middleware';
import { uploadTripCover, handleMulterError } from '../middleware/upload.middleware';

const router = Router();

// Extended request with user info and file
interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: 'user' | 'admin';
  };
  file?: Express.Multer.File;
}

// @desc    Upload trip cover image
// @route   POST /api/upload/trip-cover
// @access  Private
router.post(
  '/trip-cover',
  authenticate,
  uploadTripCover.single('image'),
  handleMulterError,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
      }

      // Generate the URL for the uploaded image
      const imageUrl = `/uploads/trip-covers/${req.file.filename}`;

      res.json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          filename: req.file.filename,
          url: imageUrl,
          size: req.file.size,
          mimetype: req.file.mimetype
        }
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({ message: 'Failed to upload image' });
    }
  }
);

// @desc    Delete uploaded image
// @route   DELETE /api/upload/trip-cover/:filename
// @access  Private
router.delete(
  '/trip-cover/:filename',
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const { filename } = req.params;
      
      // Sanitize filename to prevent directory traversal
      const sanitizedFilename = path.basename(filename);
      const filePath = path.join(__dirname, '../../uploads/trip-covers', sanitizedFilename);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'Image not found' });
      }

      // Delete the file
      fs.unlinkSync(filePath);

      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } catch (error: any) {
      console.error('Delete error:', error);
      res.status(500).json({ message: 'Failed to delete image' });
    }
  }
);

export default router;
