import { Request, Response, NextFunction } from 'express';
import { Document, Types } from 'mongoose';

// Express Request Extensions
export interface AuthenticatedRequest extends Request {
  profile?: IUserDocument;
  auth?: { _id: string };
  category?: ICategoryDocument;
  product?: IProductDocument;
  order?: IOrderDocument;
}

// User Types
export interface IUser {
  name: string;
  email: string;
  hashed_password: string;
  salt?: string;
  about?: string;
  role: number;
  history: Array<{
    _id: string;
    name: string;
    description: string;
    category: string;
    quantity: number;
    transaction_id: string;
    amount: number;
  }>;
  _password?: string;
}

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  authenticate(plainText: string): boolean;
  encryptPassword(password: string): string;
}

// Category Types
export interface ICategory {
  name: string;
}

export interface ICategoryDocument extends ICategory, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Product Types
export interface IProduct {
  name: string;
  description: string;
  price: number;
  category: Types.ObjectId;
  quantity?: number;
  sold?: number;
  photo?: {
    data: Buffer;
    contentType: string;
  };
  shipping?: boolean;
}

export interface IProductDocument extends IProduct, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Cart Item Types
export interface ICartItem {
  product: Types.ObjectId;
  name: string;
  price: number;
  count: number;
}

export interface ICartItemDocument extends ICartItem, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Order Types
export type OrderStatus =
  | 'Not processed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export interface IOrder {
  products: ICartItem[];
  transaction_id?: string;
  amount: number;
  address: string;
  status: OrderStatus;
  updated?: Date;
  user: Types.ObjectId;
}

export interface IOrderDocument extends IOrder, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Request Body Types
export interface SignupRequestBody {
  name: string;
  email: string;
  password: string;
}

export interface SigninRequestBody {
  email: string;
  password: string;
}

export interface CreateOrderRequestBody {
  order: {
    products: Array<{
      _id: string;
      name: string;
      description: string;
      category: string;
      count: number;
    }>;
    transaction_id?: string;
    amount: number;
    address: string;
    user?: unknown;
  };
}

export interface UpdateOrderStatusRequestBody {
  orderId: string;
  status: OrderStatus;
}

export interface ProductFilters {
  price?: [number, number];
  category?: string[];
}

export interface SearchRequestBody {
  order?: 'asc' | 'desc';
  sortBy?: string;
  limit?: number;
  skip: number;
  filters: ProductFilters;
}

export interface PaymentRequestBody {
  paymentMethodNonce: string;
  amount: string;
}

// Controller Function Types
export type ControllerFunction = (
  req: AuthenticatedRequest,
  res: Response,
  next?: NextFunction
) => Promise<void | Response> | void | Response;

export type ParamFunction = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
  id: string
) => Promise<void> | void;

// Error Types
export interface MongoError extends Error {
  code?: number;
  message: string;
  errorors?: Record<string, { message: string }>;
}

// Braintree Types
export interface BraintreeGateway {
  clientToken: {
    generate(options: Record<string, unknown>, callback: (err: Error | null, response: { clientToken: string }) => void): void;
  };
  transaction: {
    sale(
      request: {
        amount: string;
        paymentMethodNonce: string;
        options: { submitForSettlement: boolean };
      },
      callback: (error: Error | null, result: unknown) => void
    ): void;
  };
}
