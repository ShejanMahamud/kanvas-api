import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { IUser, User } from '../models/user.model';
import { CustomError } from '../utils/customError';

interface JwtPayload {
  id: string;
  role: string;
}

// Extend Express Request type using module augmentation
declare module 'express' {
  interface Request {
    user?: IUser;
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new CustomError('No token provided', 401);
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key',
    ) as JwtPayload;
    const user = await User.findOne({ _id: decoded.id });

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(401).json({ error: 'Please authenticate.' });
    }
  }
};

export const adminAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await auth(req, res, () => {
      if (req.user?.role !== 'admin') {
        throw new CustomError('Access denied. Admin only.', 403);
      }
      next();
    });
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(401).json({ error: 'Please authenticate.' });
    }
  }
};
