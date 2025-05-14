import { NextFunction, Request, Response } from 'express';
import config from '../config';
import { CustomError } from '../utils/customError';

export const validateApiKey = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    throw new CustomError('API key is required', 401);
  }

  if (apiKey !== config.apiKey) {
    throw new CustomError('Invalid API key', 401);
  }

  next();
};
