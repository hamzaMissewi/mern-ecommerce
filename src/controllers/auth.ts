import dotenv from 'dotenv';
import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { expressjwt } from 'express-jwt';
import { errorHandler } from '../helpers/dbErrorHandler';
import User from '../models/user';
import { AuthenticatedRequest, SignupRequestBody, SigninRequestBody } from '../types';

dotenv.config();

export const signup = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  const user = new User(req.body as SignupRequestBody);
  try {
    const data = await user.save();
    if (!data) {
      return res.status(400).json({
        error: errorHandler(new Error('Failed to save user') as any),
      });
    }

    user.salt = undefined;
    user.hashed_password = "";
    return res.json({ user });
  } catch (err) {
    return res.status(400).json({
      error: errorHandler(err as any),
    });
  }
};

export const signin = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  const { email, password } = req.body as SigninRequestBody;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        error: "User with that email doesn't exist. Please signup.",
      });
    }

    if (!user.authenticate(password)) {
      return res.status(401).json({
        error: "Email and password didn't match",
      });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET as string);

    res.cookie('t', token, { expires: new Date(Date.now() + 9999) });

    const { _id, name, email: userEmail, role } = user;
    return res.json({ token, user: { _id, email: userEmail, name, role } });
  } catch (err) {
    return res.status(400).json({
      error: 'Signin failed. Please try again later.',
    });
  }
};

export const signout = (_req: AuthenticatedRequest, res: Response): Response => {
  res.clearCookie('t');
  return res.json({ message: 'Signout success' });
};

export const requireSignin = expressjwt({
  secret: process.env.JWT_SECRET as string,
  algorithms: ['HS256'],
  // userProperty: 'auth',
});

export const isAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): Response | void => {
  const user = req.profile && req.auth && req.profile._id.toString() === req.auth._id;
  if (!user) {
    return res.status(403).json({
      error: 'Access denied',
    });
  }
  next();
};

export const isAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): Response | void => {
  if (req.profile?.role === 0) {
    return res.status(403).json({
      error: 'Admin resource! Access denied',
    });
  }
  next();
};
