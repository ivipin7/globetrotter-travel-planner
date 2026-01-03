import mongoose, { Schema, Document } from 'mongoose';

// Itinerary Activity interface
export interface IActivity {
  _id?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  category: 'transport' | 'accommodation' | 'food' | 'activity' | 'sightseeing' | 'shopping' | 'other';
  cost?: number;
  isCompleted: boolean;
  notes?: string;
  order: number;
}

// Itinerary Day interface
export interface IItineraryDay {
  _id?: mongoose.Types.ObjectId;
  date: Date;
  dayNumber: number;
  title?: string;
  activities: IActivity[];
}

// Packing List Item interface
export interface IPackingItem {
  _id?: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  category: 'clothing' | 'toiletries' | 'electronics' | 'documents' | 'medicine' | 'accessories' | 'other';
  isPacked: boolean;
}

export interface ITrip extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  destination?: string;
  tripType?: 'solo' | 'couple' | 'family' | 'friends' | 'business';
  travelers?: number;
  coverImageUrl?: string;
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'upcoming' | 'ongoing' | 'completed';
  isPublic: boolean;
  publicUrl?: string;
  totalBudget?: number;
  currency: string;
  itinerary: IItineraryDay[];
  packingList: IPackingItem[];
  createdAt: Date;
  updatedAt: Date;
}

const TripSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Trip name is required'],
      trim: true,
      minlength: [3, 'Trip name must be at least 3 characters long'],
      maxlength: [100, 'Trip name cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    destination: {
      type: String,
      trim: true,
      maxlength: [200, 'Destination cannot exceed 200 characters']
    },
    tripType: {
      type: String,
      enum: ['solo', 'couple', 'family', 'friends', 'business'],
      default: 'solo'
    },
    travelers: {
      type: Number,
      min: [1, 'At least 1 traveler required'],
      max: [50, 'Maximum 50 travelers'],
      default: 1
    },
    coverImageUrl: {
      type: String,
      default: null
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function(this: ITrip, value: Date) {
          return value >= this.startDate;
        },
        message: 'End date must be after start date'
      }
    },
    status: {
      type: String,
      enum: ['draft', 'upcoming', 'ongoing', 'completed'],
      default: 'draft'
    },
    isPublic: {
      type: Boolean,
      default: false
    },
    publicUrl: {
      type: String,
      unique: true,
      sparse: true
    },
    totalBudget: {
      type: Number,
      min: [0, 'Budget cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR'
    },
    itinerary: [{
      date: { type: Date, required: true },
      dayNumber: { type: Number, required: true },
      title: { type: String },
      activities: [{
        title: { type: String, required: true },
        description: { type: String },
        location: { type: String },
        startTime: { type: String },
        endTime: { type: String },
        category: {
          type: String,
          enum: ['transport', 'accommodation', 'food', 'activity', 'sightseeing', 'shopping', 'other'],
          default: 'activity'
        },
        cost: { type: Number, min: 0 },
        isCompleted: { type: Boolean, default: false },
        notes: { type: String },
        order: { type: Number, default: 0 }
      }]
    }],
    packingList: [{
      name: { type: String, required: true },
      quantity: { type: Number, default: 1, min: 1 },
      category: {
        type: String,
        enum: ['clothing', 'toiletries', 'electronics', 'documents', 'medicine', 'accessories', 'other'],
        default: 'other'
      },
      isPacked: { type: Boolean, default: false }
    }]
  },
  {
    timestamps: true
  }
);

// Create compound index for user queries
TripSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<ITrip>('Trip', TripSchema);
