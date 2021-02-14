import mongoose, { Schema } from 'mongoose';

const locationSchema = new mongoose.Schema(
  {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Numbers], index: '2dsphere' },
  },
  { timestamps: true }
);

const Location = mongoose.model('Location', locationSchema);

export default Location;
