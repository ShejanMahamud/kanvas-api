import crypto from 'crypto';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import { IUser, User } from '../models/user.model';
import { CustomError } from '../utils/customError';

// Add interface for authenticated request
interface AuthRequest extends Request {
  user?: IUser;
}

const generateToken = (userId: string, role: string): string => {
  return jwt.sign({ id: userId, role }, config.jwtSecret, {
    expiresIn: '7d',
  });
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new CustomError('Email already registered', 400);
    }

    const user = new User({
      email,
      password,
      name,
      role: 'user',
    });

    await user.save();
    const token = generateToken(user._id.toString(), user.role);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('Error creating user', 500);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw new CustomError('Invalid credentials', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new CustomError('Invalid credentials', 401);
    }

    const token = generateToken(user._id.toString(), user.role);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('Error logging in', 500);
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // In a real application, you would send this token via email
    res.json({
      success: true,
      message: 'Password reset token generated',
      data: { resetToken },
    });
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('Error processing request', 500);
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new CustomError('Invalid or expired reset token', 400);
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('Error resetting password', 500);
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    // In a real application, you might want to invalidate the token
    // For now, we'll just send a success response
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('Error logging out', 500);
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email } = req.body;
    if (!req.user) {
      throw new CustomError('User not authenticated', 401);
    }
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new CustomError('Email already in use', 400);
      }
      user.email = email;
    }

    if (name) {
      user.name = name;
    }

    await user.save();

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    });
  } catch (error) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('Error updating user', 500);
  }
};
