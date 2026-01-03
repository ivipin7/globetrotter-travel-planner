import mongoose, { Schema, Document } from 'mongoose';

export interface ICity extends Document {
  name: string;
  country: string;
  region: string;
  latitude?: number;
  longitude?: number;
  costIndex: number;
  popularityScore?: number;
  imageUrl?: string;
  description?: string;
  tags: string[];
  highlights?: string[]; // Top attractions/activities
  bestTimeToVisit?: string; // Best season/months
  source: 'local' | 'global'; // Track where the destination came from
  createdAt: Date;
}

const CitySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'City name is required'],
      trim: true,
      index: true
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      index: true
    },
    region: {
      type: String,
      enum: ['Asia', 'Europe', 'North America', 'South America', 'Africa', 'Middle East', 'Oceania'],
      index: true
    },
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    },
    costIndex: {
      type: Number,
      required: true,
      min: 1,
      max: 4
    },
    popularityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    imageUrl: {
      type: String
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    tags: [{
      type: String,
      trim: true
    }],
    highlights: [{
      type: String,
      trim: true
    }],
    bestTimeToVisit: {
      type: String,
      trim: true
    },
    source: {
      type: String,
      enum: ['local', 'global'],
      default: 'local'
    }
  },
  {
    timestamps: true
  }
);

// Text index for search
CitySchema.index({ name: 'text', country: 'text', tags: 'text' });

// Compound indexes for common queries
CitySchema.index({ region: 1, popularityScore: -1 });
CitySchema.index({ costIndex: 1, popularityScore: -1 });

export default mongoose.model<ICity>('City', CitySchema);
