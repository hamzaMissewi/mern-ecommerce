import { NextFunction, Response } from 'express';
import { errorHandler } from '../helpers/dbErrorHandler';
import { Order } from '../models/order';
import {
  AuthenticatedRequest,
  CreateOrderRequestBody,
  UpdateOrderStatusRequestBody
} from '../types';

export const orderById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
  id: string
): Promise<Response | void> => {
  try {
    const order = await Order.findById(id)
      .populate('products.product', 'name price')
      .exec();
    if (!order) {
      return res.status(400).json({
        error: 'Order not found',
      });
    }
    req.order = order;
    next();
  } catch (err) {
    return res.status(400).json({
      error: errorHandler(err as any),
    });
  }
};

export const create = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const body = req.body as CreateOrderRequestBody;
    body.order.user = req.profile?._id;
    const order = new Order(body.order);
    const data = await order.save();
    return res.json(data);
  } catch (error) {
    return res.status(400).json({
      error: errorHandler(error as any),
    });
  }
};

export const listOrders = async (_req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const orders = await Order.find()
      .populate('user', '_id name address')
      .sort('-created')
      .exec();
    return res.json(orders);
  } catch (error) {
    return res.status(400).json({
      error: errorHandler(error as any),
    });
  }
};

export const getStatusValues = (_req: AuthenticatedRequest, res: Response): Response => {
  return res.json(Order.schema.path('status').options.enum);
};

export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const { orderId, status } = req.body as UpdateOrderStatusRequestBody;
    const order = await Order.updateOne(
      { _id: orderId },
      { $set: { status } }
    );
    return res.json(order);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler(err as any),
    });
  }
};
