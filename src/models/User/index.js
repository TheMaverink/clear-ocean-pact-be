import mongoose, { Schema } from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config({ path: '.env' });

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    yacht: {
      type: Schema.Types.ObjectId,
      ref: 'Yacht',
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    profileImage: {
      type: String,
      required: false,
    },
    position: {
      type: String,
    },
    entries: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Entry',
      },
    ],
    isPrivateProfile: {
      type: Boolean,
      default: false,
    },
    resetPasswordCode:{
      type:String,
      trim: true,
    }
    // settings: {
    //   private: {
    //     type: Boolean,
    //     default: false,
    //   },
    // },
   
  },
  { timestamps: true }
);

userSchema.virtual('entriesCount').get(function () {
  return this.entries.length;
});

userSchema.methods.generateJwtToken = async function () {
  const user = this;

  const token = jwt.sign({ _id: user.id.toString() }, process.env.JWT_SECRET);

  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

userSchema.methods.getPublicProfile = function () {
  const user = this;
  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.tokens;
  return userObj;
};

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  next();
});

const User = mongoose.model('User', userSchema);

export default User;
