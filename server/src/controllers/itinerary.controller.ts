import { Request, Response } from 'express';
import Trip, { IItineraryDay, IActivity } from '../models/Trip';
import mongoose from 'mongoose';

// Get trip itinerary
export const getItinerary = async (req: Request, res: Response) => {
  try {
    const { tripId } = req.params;
    const userId = req.user?.userId;

    const trip = await Trip.findOne({ _id: tripId, userId }).select('itinerary startDate endDate name destination');
    
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    // Calculate number of days
    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);
    const dayCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Initialize itinerary if empty
    if (!trip.itinerary || trip.itinerary.length === 0) {
      const itinerary: IItineraryDay[] = [];
      for (let i = 0; i < dayCount; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        itinerary.push({
          date,
          dayNumber: i + 1,
          title: `Day ${i + 1}`,
          activities: []
        });
      }
      trip.itinerary = itinerary;
      await trip.save();
    }

    res.json({
      success: true,
      data: {
        tripId: trip._id,
        tripName: trip.name,
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        dayCount,
        itinerary: trip.itinerary
      }
    });
  } catch (error) {
    console.error('Get itinerary error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Add activity to a day
export const addActivity = async (req: Request, res: Response) => {
  try {
    const { tripId, dayNumber } = req.params;
    const userId = req.user?.userId;
    const activityData: IActivity = req.body;

    const trip = await Trip.findOne({ _id: tripId, userId });
    
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    const dayIndex = trip.itinerary.findIndex(d => d.dayNumber === parseInt(dayNumber));
    
    if (dayIndex === -1) {
      return res.status(404).json({ success: false, message: 'Day not found' });
    }

    // Set order to end of list
    activityData.order = trip.itinerary[dayIndex].activities.length;
    activityData.isCompleted = false;

    trip.itinerary[dayIndex].activities.push(activityData);
    await trip.save();

    res.status(201).json({
      success: true,
      message: 'Activity added',
      data: trip.itinerary[dayIndex]
    });
  } catch (error) {
    console.error('Add activity error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update activity
export const updateActivity = async (req: Request, res: Response) => {
  try {
    const { tripId, dayNumber, activityId } = req.params;
    const userId = req.user?.userId;
    const updates = req.body;

    const trip = await Trip.findOne({ _id: tripId, userId });
    
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    const dayIndex = trip.itinerary.findIndex(d => d.dayNumber === parseInt(dayNumber));
    
    if (dayIndex === -1) {
      return res.status(404).json({ success: false, message: 'Day not found' });
    }

    const activityIndex = trip.itinerary[dayIndex].activities.findIndex(
      a => a._id?.toString() === activityId
    );

    if (activityIndex === -1) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    // Update activity fields
    Object.assign(trip.itinerary[dayIndex].activities[activityIndex], updates);
    await trip.save();

    res.json({
      success: true,
      message: 'Activity updated',
      data: trip.itinerary[dayIndex].activities[activityIndex]
    });
  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete activity
export const deleteActivity = async (req: Request, res: Response) => {
  try {
    const { tripId, dayNumber, activityId } = req.params;
    const userId = req.user?.userId;

    const trip = await Trip.findOne({ _id: tripId, userId });
    
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    const dayIndex = trip.itinerary.findIndex(d => d.dayNumber === parseInt(dayNumber));
    
    if (dayIndex === -1) {
      return res.status(404).json({ success: false, message: 'Day not found' });
    }

    trip.itinerary[dayIndex].activities = trip.itinerary[dayIndex].activities.filter(
      a => a._id?.toString() !== activityId
    );

    // Re-order remaining activities
    trip.itinerary[dayIndex].activities.forEach((activity, index) => {
      activity.order = index;
    });

    await trip.save();

    res.json({
      success: true,
      message: 'Activity deleted',
      data: trip.itinerary[dayIndex]
    });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Toggle activity completion
export const toggleActivityComplete = async (req: Request, res: Response) => {
  try {
    const { tripId, dayNumber, activityId } = req.params;
    const userId = req.user?.userId;

    const trip = await Trip.findOne({ _id: tripId, userId });
    
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    const dayIndex = trip.itinerary.findIndex(d => d.dayNumber === parseInt(dayNumber));
    
    if (dayIndex === -1) {
      return res.status(404).json({ success: false, message: 'Day not found' });
    }

    const activityIndex = trip.itinerary[dayIndex].activities.findIndex(
      a => a._id?.toString() === activityId
    );

    if (activityIndex === -1) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    // Toggle completion
    trip.itinerary[dayIndex].activities[activityIndex].isCompleted = 
      !trip.itinerary[dayIndex].activities[activityIndex].isCompleted;
    
    await trip.save();

    res.json({
      success: true,
      data: trip.itinerary[dayIndex].activities[activityIndex]
    });
  } catch (error) {
    console.error('Toggle activity error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Reorder activities within a day
export const reorderActivities = async (req: Request, res: Response) => {
  try {
    const { tripId, dayNumber } = req.params;
    const userId = req.user?.userId;
    const { activityIds } = req.body; // Array of activity IDs in new order

    const trip = await Trip.findOne({ _id: tripId, userId });
    
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    const dayIndex = trip.itinerary.findIndex(d => d.dayNumber === parseInt(dayNumber));
    
    if (dayIndex === -1) {
      return res.status(404).json({ success: false, message: 'Day not found' });
    }

    // Reorder activities based on provided order
    const reorderedActivities = activityIds.map((id: string, index: number) => {
      const activity = trip.itinerary[dayIndex].activities.find(
        a => a._id?.toString() === id
      );
      if (activity) {
        activity.order = index;
      }
      return activity;
    }).filter(Boolean);

    trip.itinerary[dayIndex].activities = reorderedActivities;
    await trip.save();

    res.json({
      success: true,
      message: 'Activities reordered',
      data: trip.itinerary[dayIndex]
    });
  } catch (error) {
    console.error('Reorder activities error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update day title
export const updateDayTitle = async (req: Request, res: Response) => {
  try {
    const { tripId, dayNumber } = req.params;
    const userId = req.user?.userId;
    const { title } = req.body;

    const trip = await Trip.findOne({ _id: tripId, userId });
    
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    const dayIndex = trip.itinerary.findIndex(d => d.dayNumber === parseInt(dayNumber));
    
    if (dayIndex === -1) {
      return res.status(404).json({ success: false, message: 'Day not found' });
    }

    trip.itinerary[dayIndex].title = title;
    await trip.save();

    res.json({
      success: true,
      message: 'Day title updated',
      data: trip.itinerary[dayIndex]
    });
  } catch (error) {
    console.error('Update day title error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
