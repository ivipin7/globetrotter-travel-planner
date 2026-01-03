import { Request, Response } from 'express';
import Trip, { ITrip } from '../models/Trip';
import mongoose from 'mongoose';

// Extended request with user info
interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

// @desc    Create a new trip
// @route   POST /api/trips
// @access  Private
export const createTrip = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, coverImageUrl, startDate, endDate, status, isPublic, totalBudget } = req.body;

    const trip = await Trip.create({
      userId: req.user?.userId,
      name,
      description,
      coverImageUrl: coverImageUrl || `https://source.unsplash.com/800x600/?travel,${encodeURIComponent(name)}`,
      startDate,
      endDate,
      status: status || 'draft',
      isPublic: isPublic || false,
      totalBudget
    });

    res.status(201).json({
      success: true,
      data: trip
    });
  } catch (error: any) {
    console.error('Create trip error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Failed to create trip' });
  }
};

// @desc    Get all trips for current user
// @route   GET /api/trips
// @access  Private
export const getMyTrips = async (req: AuthRequest, res: Response) => {
  try {
    const { status, sort = '-createdAt', page = 1, limit = 10 } = req.query;

    const query: any = { userId: req.user?.userId };
    
    // Filter by status if provided
    if (status && status !== 'all') {
      query.status = status;
    }

    const trips = await Trip.find(query)
      .sort(sort as string)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Trip.countDocuments(query);

    res.json({
      success: true,
      data: trips,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({ message: 'Failed to fetch trips' });
  }
};

// @desc    Get single trip by ID
// @route   GET /api/trips/:id
// @access  Private (owner) or Public (if trip is public)
export const getTripById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid trip ID' });
    }

    const trip = await Trip.findById(id).populate('userId', 'name email avatar');

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check if user can access this trip
    const isOwner = trip.userId._id.toString() === req.user?.userId;
    if (!isOwner && !trip.isPublic) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      success: true,
      data: trip,
      isOwner
    });
  } catch (error) {
    console.error('Get trip error:', error);
    res.status(500).json({ message: 'Failed to fetch trip' });
  }
};

// @desc    Update trip
// @route   PUT /api/trips/:id
// @access  Private (owner only)
export const updateTrip = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid trip ID' });
    }

    const trip = await Trip.findById(id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check ownership
    if (trip.userId.toString() !== req.user?.userId) {
      return res.status(403).json({ message: 'Not authorized to update this trip' });
    }

    const allowedUpdates = ['name', 'description', 'coverImageUrl', 'startDate', 'endDate', 'status', 'isPublic', 'totalBudget'];
    const updates: any = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedTrip = await Trip.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedTrip
    });
  } catch (error: any) {
    console.error('Update trip error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Failed to update trip' });
  }
};

// @desc    Delete trip
// @route   DELETE /api/trips/:id
// @access  Private (owner only)
export const deleteTrip = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid trip ID' });
    }

    const trip = await Trip.findById(id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check ownership
    if (trip.userId.toString() !== req.user?.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this trip' });
    }

    await Trip.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Trip deleted successfully'
    });
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({ message: 'Failed to delete trip' });
  }
};

// @desc    Get public/community trips
// @route   GET /api/trips/community
// @access  Public
export const getCommunityTrips = async (req: Request, res: Response) => {
  try {
    const { sort = '-createdAt', page = 1, limit = 12 } = req.query;

    const trips = await Trip.find({ isPublic: true })
      .populate('userId', 'name avatar')
      .sort(sort as string)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Trip.countDocuments({ isPublic: true });

    res.json({
      success: true,
      data: trips,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get community trips error:', error);
    res.status(500).json({ message: 'Failed to fetch community trips' });
  }
};

// @desc    Get trip stats for dashboard
// @route   GET /api/trips/stats
// @access  Private
export const getTripStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user?.userId);

    const stats = await Trip.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalTrips: { $sum: 1 },
          totalBudget: { $sum: { $ifNull: ['$totalBudget', 0] } },
          draftCount: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
          upcomingCount: { $sum: { $cond: [{ $eq: ['$status', 'upcoming'] }, 1, 0] } },
          ongoingCount: { $sum: { $cond: [{ $eq: ['$status', 'ongoing'] }, 1, 0] } },
          completedCount: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
        }
      }
    ]);

    const result = stats[0] || {
      totalTrips: 0,
      totalBudget: 0,
      draftCount: 0,
      upcomingCount: 0,
      ongoingCount: 0,
      completedCount: 0
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get trip stats error:', error);
    res.status(500).json({ message: 'Failed to fetch trip stats' });
  }
};

// @desc    Duplicate a trip
// @route   POST /api/trips/:id/duplicate
// @access  Private
export const duplicateTrip = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const originalTrip = await Trip.findById(id);

    if (!originalTrip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check if user can access this trip
    const isOwner = originalTrip.userId.toString() === req.user?.userId;
    if (!isOwner && !originalTrip.isPublic) {
      return res.status(403).json({ message: 'Cannot duplicate private trip' });
    }

    const newTrip = await Trip.create({
      userId: req.user?.userId,
      name: `${originalTrip.name} (Copy)`,
      description: originalTrip.description,
      coverImageUrl: originalTrip.coverImageUrl,
      startDate: originalTrip.startDate,
      endDate: originalTrip.endDate,
      status: 'draft',
      isPublic: false,
      totalBudget: originalTrip.totalBudget
    });

    res.status(201).json({
      success: true,
      data: newTrip
    });
  } catch (error) {
    console.error('Duplicate trip error:', error);
    res.status(500).json({ message: 'Failed to duplicate trip' });
  }
};
