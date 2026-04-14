import formidable from 'formidable';
import _ from 'lodash';
import fs from 'fs';
import { Response, NextFunction } from 'express';
import Product from '../models/product';
import { errorHandler } from '../helpers/dbErrorHandler';
import {
  AuthenticatedRequest,
  IProductDocument,
  SearchRequestBody,
  CreateOrderRequestBody
} from '../types';

export const productById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
  id: string
): Promise<Response | void> => {
  try {
    const product = await Product.findById(id).populate('category').exec();
    if (!product) {
      return res.status(400).json({ error: 'Product not found' });
    }
    req.product = product;
    next();
  } catch (err) {
    return res.status(400).json({ error: 'Product not found' });
  }
};

export const read = (req: AuthenticatedRequest, res: Response): Response => {
  const product = req.product as IProductDocument;
  product.photo = undefined;
  return res.json(product);
};

export const create = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const form = formidable({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: 'Image could not be uploaded' });
    }

    const { name, description, price, category, quantity, shipping } = fields;

    if (!name || !description || !price || !category || !quantity || !shipping) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const product = new Product(fields);

    const photoFile = files.photo;
    if (photoFile) {
      const file = Array.isArray(photoFile) ? photoFile[0] : photoFile;
      if (file.size > 1000000) {
        return res.status(400).json({ error: 'Image should be less than 1MB in size' });
      }
      product.photo = {
        data: fs.readFileSync(file.filepath),
        contentType: file.mimetype || 'image/jpeg',
      };
    }

    try {
      const result = await product.save();
      return res.json(result);
    } catch (error) {
      return res.status(400).json({ error: errorHandler(error as any) });
    }
  });
};

export const remove = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const product = req.product as IProductDocument;
    await Product.deleteOne({ _id: product._id });
    return res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    return res.status(400).json({ error: errorHandler(err as any) });
  }
};

export const update = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const form = formidable({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: 'Image could not be uploaded' });
    }

    let product = req.product as IProductDocument;
    product = _.extend(product, fields);

    const photoFile = files.photo;
    if (photoFile) {
      const file = Array.isArray(photoFile) ? photoFile[0] : photoFile;
      if (file.size > 1000000) {
        return res.status(400).json({ error: 'Image should be less than 1MB in size' });
      }
      product.photo = {
        data: fs.readFileSync(file.filepath),
        contentType: file.mimetype || 'image/jpeg',
      };
    }

    try {
      const result = await product.save();
      return res.json(result);
    } catch (err) {
      return res.status(400).json({ error: errorHandler(err as any) });
    }
  });
};

export const list = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  const order = (req.query.order as string) || 'asc';
  const sortBy = (req.query.sortBy as string) || '_id';
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;

  try {
    const products = await Product.find()
      .select('-photo')
      .populate('category')
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
      .limit(limit)
      .exec();
    return res.json(products);
  } catch (error) {
    return res.status(400).json({ error: 'Products not found' });
  }
};

export const listRelated = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
  const product = req.product as IProductDocument;

  try {
    const products = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
    })
      .limit(limit)
      .populate('category', '_id name')
      .exec();
    return res.json(products);
  } catch (error) {
    return res.status(400).json({ error: 'Products not found' });
  }
};

export const listCategories = async (_req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const categories = await Product.distinct('category', {}).exec();
    return res.json(categories);
  } catch (error) {
    return res.status(400).json({ error: 'Categories not found' });
  }
};

export const listBySearch = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  const body = req.body as SearchRequestBody;
  const order = body.order || 'desc';
  const sortBy = body.sortBy || '_id';
  const limit = body.limit || 100;
  const skip = body.skip;
  const findArgs: Record<string, unknown> = {};

  for (const key in body.filters) {
    if (body.filters[key as keyof typeof body.filters]) {
      const filterValue = body.filters[key as keyof typeof body.filters];
      if (Array.isArray(filterValue) && filterValue.length > 0) {
        if (key === 'price') {
          findArgs[key] = {
            $gte: filterValue[0],
            $lte: filterValue[1],
          };
        } else {
          findArgs[key] = filterValue;
        }
      }
    }
  }

  try {
    const products = await Product.find(findArgs)
      .select('-photo')
      .populate('category')
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .exec();
    return res.json({ size: products.length, data: products });
  } catch (error) {
    return res.status(400).json({ error: 'Products not found' });
  }
};

export const photo = (req: AuthenticatedRequest, res: Response, next: NextFunction): Response | void => {
  const product = req.product as IProductDocument;
  if (product.photo && product.photo.data) {
    res.set('Content-Type', product.photo.contentType);
    return res.send(product.photo.data);
  }
  next();
};

export const listSearch = async (req: AuthenticatedRequest, res: Response): Promise<Response | void> => {
  const query: Record<string, unknown> = {};

  if (req.query.search) {
    query.name = { $regex: req.query.search, $options: 'i' };

    if (req.query.category && req.query.category !== 'All') {
      query.category = req.query.category;
    }

    try {
      const products = await Product.find(query).select('-photo').exec();
      return res.json(products);
    } catch (error) {
      return res.status(400).json({ error: errorHandler(error as any) });
    }
  }
  return res.json([]);
};

export const decreaseQuantity = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const body = req.body as CreateOrderRequestBody;
  const bulkOps = body.order.products.map((item) => ({
    updateOne: {
      filter: { _id: item._id },
      update: { $inc: { quantity: -item.count, sold: +item.count } },
    },
  }));

  try {
    await Product.bulkWrite(bulkOps, {});
    next();
  } catch (error) {
    return res.status(400).json({ error: 'Could not update product' });
  }
};
