import { Request, Response } from 'express';
import Trip, { IPackingItem } from '../models/Trip';

// Get packing list for a trip
export const getPackingList = async (req: Request, res: Response) => {
  try {
    const { tripId } = req.params;
    const userId = req.user?.userId;

    const trip = await Trip.findOne({ _id: tripId, userId }).select('packingList name destination');
    
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    // Calculate stats
    const totalItems = trip.packingList.length;
    const packedItems = trip.packingList.filter(item => item.isPacked).length;

    res.json({
      success: true,
      data: {
        tripId: trip._id,
        tripName: trip.name,
        destination: trip.destination,
        packingList: trip.packingList,
        stats: {
          total: totalItems,
          packed: packedItems,
          remaining: totalItems - packedItems,
          progress: totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0
        }
      }
    });
  } catch (error) {
    console.error('Get packing list error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Add item to packing list
export const addPackingItem = async (req: Request, res: Response) => {
  try {
    const { tripId } = req.params;
    const userId = req.user?.userId;
    const { name, quantity, category } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Item name is required' });
    }

    const trip = await Trip.findOne({ _id: tripId, userId });
    
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    const newItem: IPackingItem = {
      name,
      quantity: quantity || 1,
      category: category || 'other',
      isPacked: false
    };

    trip.packingList.push(newItem);
    await trip.save();

    // Return the newly added item
    const addedItem = trip.packingList[trip.packingList.length - 1];

    res.status(201).json({
      success: true,
      message: 'Item added',
      data: addedItem
    });
  } catch (error) {
    console.error('Add packing item error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update packing item
export const updatePackingItem = async (req: Request, res: Response) => {
  try {
    const { tripId, itemId } = req.params;
    const userId = req.user?.userId;
    const updates = req.body;

    const trip = await Trip.findOne({ _id: tripId, userId });
    
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    const itemIndex = trip.packingList.findIndex(
      item => item._id?.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Update item fields
    Object.assign(trip.packingList[itemIndex], updates);
    await trip.save();

    res.json({
      success: true,
      message: 'Item updated',
      data: trip.packingList[itemIndex]
    });
  } catch (error) {
    console.error('Update packing item error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete packing item
export const deletePackingItem = async (req: Request, res: Response) => {
  try {
    const { tripId, itemId } = req.params;
    const userId = req.user?.userId;

    const trip = await Trip.findOne({ _id: tripId, userId });
    
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    trip.packingList = trip.packingList.filter(
      item => item._id?.toString() !== itemId
    );

    await trip.save();

    res.json({
      success: true,
      message: 'Item deleted'
    });
  } catch (error) {
    console.error('Delete packing item error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Toggle item packed status
export const togglePackedStatus = async (req: Request, res: Response) => {
  try {
    const { tripId, itemId } = req.params;
    const userId = req.user?.userId;

    const trip = await Trip.findOne({ _id: tripId, userId });
    
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    const itemIndex = trip.packingList.findIndex(
      item => item._id?.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Toggle packed status
    trip.packingList[itemIndex].isPacked = !trip.packingList[itemIndex].isPacked;
    await trip.save();

    res.json({
      success: true,
      data: trip.packingList[itemIndex]
    });
  } catch (error) {
    console.error('Toggle packed status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Add multiple items at once (for suggested items)
export const addMultipleItems = async (req: Request, res: Response) => {
  try {
    const { tripId } = req.params;
    const userId = req.user?.userId;
    const { items } = req.body; // Array of items

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Items array is required' });
    }

    const trip = await Trip.findOne({ _id: tripId, userId });
    
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    const newItems: IPackingItem[] = items.map(item => ({
      name: item.name,
      quantity: item.quantity || 1,
      category: item.category || 'other',
      isPacked: false
    }));

    trip.packingList.push(...newItems);
    await trip.save();

    res.status(201).json({
      success: true,
      message: `Added ${newItems.length} items`,
      data: trip.packingList
    });
  } catch (error) {
    console.error('Add multiple items error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Clear all items in a category
export const clearCategory = async (req: Request, res: Response) => {
  try {
    const { tripId, category } = req.params;
    const userId = req.user?.userId;

    const trip = await Trip.findOne({ _id: tripId, userId });
    
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    trip.packingList = trip.packingList.filter(
      item => item.category !== category
    );

    await trip.save();

    res.json({
      success: true,
      message: `Cleared all ${category} items`,
      data: trip.packingList
    });
  } catch (error) {
    console.error('Clear category error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Mark all items as packed/unpacked
export const toggleAllPacked = async (req: Request, res: Response) => {
  try {
    const { tripId } = req.params;
    const userId = req.user?.userId;
    const { packed } = req.body; // boolean

    const trip = await Trip.findOne({ _id: tripId, userId });
    
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    trip.packingList.forEach(item => {
      item.isPacked = packed;
    });

    await trip.save();

    res.json({
      success: true,
      message: packed ? 'All items marked as packed' : 'All items unmarked',
      data: trip.packingList
    });
  } catch (error) {
    console.error('Toggle all packed error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
