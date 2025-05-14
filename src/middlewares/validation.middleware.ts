import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodType } from 'zod';
import { CustomError } from '../utils/customError';

export const validate = <T extends ZodType>(schema: T) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request data based on the schema
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        file: req.file,
      });

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = error.errors
          .map((err) => `${err.path.join('.')}: ${err.message}`)
          .join('; ');
        next(new CustomError(errorMessage, 400));
      } else {
        next(error);
      }
    }
  };
};
