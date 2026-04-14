import mongoose, { Schema, Model } from 'mongoose';
import crypto from 'crypto';
import { v1 as uuidv1 } from 'uuid';
import { IUser, IUserDocument } from '../types';

const userSchema: Schema<IUserDocument> = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    hashed_password: {
      type: String,
      required: true,
    },
    about: {
      type: String,
      trim: true,
    },
    salt: String,
    role: {
      type: Number,
      default: 0,
    },
    history: {
      type: [],
      default: [],
    },
  },
  { timestamps: true }
);

// Virtual field for password
userSchema
  .virtual('password')
  .set(function (this: IUserDocument & { _password?: string }, password: string) {
    this._password = password;
    this.salt = uuidv1();
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function (this: IUserDocument & { _password?: string }) {
    return this._password;
  });

// Instance methods
userSchema.methods.authenticate = function (
  this: IUserDocument,
  plainText: string
): boolean {
  return this.encryptPassword(plainText) === this.hashed_password;
};

userSchema.methods.encryptPassword = function (
  this: IUserDocument,
  password: string
): string {
  if (!password) return '';
  try {
    return crypto
      .createHmac('sha1', this.salt || '')
      .update(password)
      .digest('hex');
  } catch (err) {
    return '';
  }
};

const User: Model<IUserDocument> = mongoose.model<IUserDocument>('User', userSchema);

export default User;
