 import mongoose, { Schema } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const yachtSchema = new mongoose.Schema(
  {
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    pendingUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    invitedUsers: [
      {
        name: String,
        email: String,
      },
    ],
    admin: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      // unique: true,
    },
    entries: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Entry',
        // unique: true,
      },
    ],
    name: {
      type: String,
      trim: true,
      required: true,
    },
    flag: {
      type: String,
      required: true,
    },
    officialNumber: {
      type: String,
    },
    yachtUniqueName: {
      type: String,

      required: true,
    },
    yachtImage: {
      type: String,
      required: false,
    },
    // settings: {
    //   private: {
    //     type: Boolean,
    //     default: false,
    //   },
    // },
    isPrivateProfile: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

yachtSchema.pre('save', async function (next) {
  if (this.isModified('name') || this.isModified('flag')) {
    const yachtUniqueName = this.name + this.flag;
    this.yachtUniqueName = yachtUniqueName;
  }

  next();
});

const Yacht = mongoose.model('Yacht', yachtSchema);

export default Yacht;
