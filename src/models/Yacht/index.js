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
    admin: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
    },
    name: {
      type: String,
      trim: true,
    },
    flag: {
      type: String,
      required: false,
    },
    officialNumber: {
      type: String,
      required: false,
    },
    yachtUniqueName:{
      type: String,
      required: false,
    },
    yachtImage: {
      type: String,
      required: false,
    },
    settings: {
      private: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true }
);


userSchema.pre('save', async function (next) {
  if (this.isModified('name') || this.isModified('flag') ) {
    const yachtUniqueName = this.name + this.flag;
    this.yachtUniqueName = yachtUniqueName;
  }

  next();
});

const Yacht = mongoose.model('Yacht', yachtSchema);

export default Yacht;
