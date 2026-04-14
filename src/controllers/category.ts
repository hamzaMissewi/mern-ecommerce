import { Response, NextFunction } from 'express';
import Category from '../models/category';
import { errorHandler } from '../helpers/dbErrorHandler';
import { AuthenticatedRequest, ICategoryDocument } from '../types';

export const categoryById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
  id: string
): Promise<Response | void> => {
  try {
    const category = await Category.findById(id).exec();
    if (!category) {
      return res.status(400).json({
        error: "Category doesn't exist",
      });
    }
    req.category = category;
    next();
  } catch (err) {
    return res.status(400).json({
      error: errorHandler(err as any),
    });
  }
};

export const create = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  const category = new Category(req.body);
  try {
    const data = await category.save();
    return res.json({ data });
  } catch (err) {
    return res.status(400).json({
      error: errorHandler(err as any),
    });
  }
};

export const read = (req: AuthenticatedRequest, res: Response): Response => {
  return res.json(req.category);
};

export const update = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  const category = req.category as ICategoryDocument;
  category.name = req.body.name;
  try {
    const data = await category.save();
    return res.json(data);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler(err as any),
    });
  }
};

export const remove = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  const category = req.category as ICategoryDocument;
  try {
    await Category.deleteOne({ _id: category._id });
    return res.json({
      message: 'Category deleted',
    });
  } catch (err) {
    return res.status(400).json({
      error: errorHandler(err as any),
    });
  }
};

export const list = async (_req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const data = await Category.find().exec();
    return res.json(data);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler(err as any),
    });
  }
};
