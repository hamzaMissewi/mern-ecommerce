import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const userSignupValidator = [
  body('name').notEmpty().withMessage('Name is required'),

  body('email')
    .isLength({ min: 4, max: 32 })
    .withMessage('Email must be between 3 to 32 characters')
    .isEmail()
    .withMessage('Must be a valid email address'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must contain at least 6 characters')
    .matches(/\d/)
    .withMessage('Password must contain a number'),

  (req: Request, res: Response, next: NextFunction): void | Response => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0].msg;
      return res.status(400).json({ error: firstError });
    }
    next();
  },
];
