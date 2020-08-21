import mongoose, { Schema } from 'mongoose';

const entrySchema = new mongoose.Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required:true
    },
    yacht: {
      type: Schema.Types.ObjectId,
      ref: 'Yacht',
      required:true
    },
    location: {
      type: [String],
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
      private: {
        type: Boolean,
        default:false
      },
  },
    
    // findingTypes: {
    //   fishingEquip: {
    //     type: Boolean,
    //     required: true,
    //   },
    //   bottles: {
    //     type: Boolean,
    //     required: true,
    //   },
    //   packaging: {
    //     type: Boolean,
    //     required: true,
    //   },
    //   polystyrene: {
    //     type: Boolean,
    //     required: true,
    //   },
    //   rope: {
    //     type: Boolean,
    //     required: true,
    //   },
    //   other: {
    //     otherValue: {
    //       type: Boolean,
    //       required: true,
    //     },
    //     otherDescription: {
    //       type: String,
    //     },
    //   },
    // },

    // manufacturers: {
    //   cocacola: {
    //     type: Boolean,
    //     required: true,
    //   },
    //   pepsi: {
    //     type: Boolean,
    //     required: true,
    //   },
    //   nestle: {
    //     type: Boolean,
    //     required: true,
    //   },
    //   danone: {
    //     type: Boolean,
    //     required: true,
    //   },
    //   mondelez: {
    //     type: Boolean,
    //     required: true,
    //   },
    //   procterGamble: {
    //     type: Boolean,
    //     required: true,
    //   },
    //   unilever: {
    //     type: Boolean,
    //     required: true,
    //   },
    //   mars: {
    //     type: Boolean,
    //     required: true,
    //   },
    //   colgate: {
    //     type: Boolean,
    //     required: true,
    //   },
    //   other: {
    //     otherValue: {
    //       type: Boolean,
    //       required: true,
    //     },
    //     otherDescription: {
    //       type: String,
    //       trim: true,
    //     },
    //   },
    // },
  },
  { timestamps: true }
);

const Entry = mongoose.model('Entry', entrySchema);

export default Entry;
