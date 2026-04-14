import { Response, NextFunction } from 'express';
import User from '../models/user';
import { Order } from '../models/order';
import { errorHandler } from '../helpers/dbErrorHandler';
import { AuthenticatedRequest, IUserDocument, CreateOrderRequestBody } from '../types';

export const userById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
  id: string
): Promise<Response | void> => {
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    req.profile = user;
    next();
  } catch (err) {
    return res.status(400).json({ error: 'User not found' });
  }
};

export const read = (req: AuthenticatedRequest, res: Response): Response => {
  const profile = req.profile as IUserDocument;
  profile.hashed_password = "";
  profile.salt = undefined;
  return res.json(profile);
};

export const update = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const user = await User.findByIdAndUpdate(
      { _id: req.profile?._id },
      { $set: req.body },
      { new: true }
    );
    if (!user) {
      return res.status(400).json({
        error: 'You are not authorized to perform this action',
      });
    }
    user.hashed_password = undefined;
    user.salt = undefined;
    return res.json(user);
  } catch (err) {
    return res.status(400).json({
      error: 'You are not authorized to perform this action',
    });
  }
};

export const addOrderToUserHistory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const history: Array<{
    _id: string;
    name: string;
    description: string;
    category: string;
    quantity: number;
    transaction_id: string;
    amount: number;
  }> = [];

  const body = req.body as CreateOrderRequestBody;

  body.order.products.forEach((item) => {
    history.push({
      _id: item._id,
      name: item.name,
      description: item.description,
      category: item.category,
      quantity: item.count,
      transaction_id: body.order.transaction_id || '',
      amount: body.order.amount,
    });
  });

  try {
    await User.findByIdAndUpdate(
      { _id: req.profile?._id },
      { $push: { history: history } },
      { new: true }
    );
    next();
  } catch (error) {
    return res.status(400).json({
      error: 'Could not update user purchase history',
    });
  }
};

export const purchaseHistory = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const orders = await Order.find({ user: req.profile?._id })
      .populate('user', '_id name')
      .sort('-created')
      .exec();
    return res.json(orders);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler(err as any),
    });
  }
};

export const users = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const users = await User.find().exec();
    return res.json(users);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler(err as any),
    });
  }
};
