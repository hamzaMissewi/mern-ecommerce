import mongoose, { Schema, Model } from 'mongoose';
import { ICategory, ICategoryDocument } from '../types';

const categorySchema: Schema<ICategoryDocument> = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
      unique: true,
    },
  },
  { timestamps: true }
);

const Category: Model<ICategoryDocument> = mongoose.model<ICategoryDocument>('Category', categorySchema);

export default Category;
