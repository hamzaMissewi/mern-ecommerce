import mongoose, { Model, Schema } from 'mongoose';
import {
  ICartItemDocument,
  IOrderDocument,
  OrderStatus
} from '../types';

const { ObjectId } = mongoose.Schema.Types;

const CartItemSchema: Schema<ICartItemDocument> = new mongoose.Schema(
  {
    product: { type: ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    count: Number,
  },
  { timestamps: true }
);

const CartItem: Model<ICartItemDocument> = mongoose.model<ICartItemDocument>('CartItem', CartItemSchema);

const OrderSchema: Schema<IOrderDocument> = new mongoose.Schema(
  {
    products: [CartItemSchema],
    transaction_id: {},
    amount: { type: Number },
    address: String,
    status: {
      type: String,
      default: 'Not processed' as OrderStatus,
      enum: [
        'Not processed',
        'Processing',
        'Shipped',
        'Delivered',
        'Cancelled',
      ] as OrderStatus[],
    },
    updated: Date,
    user: { type: ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const Order: Model<IOrderDocument> = mongoose.model<IOrderDocument>('Order', OrderSchema);

export { CartItem, Order };

