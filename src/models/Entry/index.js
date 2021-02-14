import mongoose, { Schema } from 'mongoose';

const entrySchema = new mongoose.Schema(
  {
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
        index: '2dsphere',
      },
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    yacht: {
      type: Schema.Types.ObjectId,
      ref: 'Yacht',
      required: true,
    },

    imageUrl: {
      type: [String],
    },
    types: {
      type: [String],
    },
    manufacturers: {
      type: [String],
    },
    settings: {
      isPrivate: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true }
);

// Geocode & create location
// StoreSchema.pre('save', async function(next) {
//   const loc = await geocoder.geocode(this.address);
//   this.location = {
//     type: 'Point',
//     coordinates: [loc[0].longitude, loc[0].latitude],

//   };

//   // Do not save address
//   this.address = undefined;
//   next();
// });

const Entry = mongoose.model('Entry', entrySchema);

export default Entry;
