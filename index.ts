import compression from 'compression';
import cors from 'cors';
import type { Application, NextFunction, Request, Response } from 'express';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import config from './src/config';
import { swaggerSpec } from './src/config/swagger';
import { connectDB } from './src/helpers/db';
import { validateApiKey } from './src/middlewares/apiKey';
import { errorHandler, notFoundHandler } from './src/middlewares/errorHandler';
import authRoutes from './src/routes/auth.routes';
import categoryRoutes from './src/routes/category.routes';
import healthRouter from './src/routes/health';
import notificationRoutes from './src/routes/notification.routes';
import subscriptionRoutes from './src/routes/subscription.routes';
import wallpaperRoutes from './src/routes/wallpaper.routes';
import { CustomError } from './src/utils/customError';
import logger from './src/utils/logger';

// --- BEGIN Global Error Handlers ---
process.on('unhandledRejection', (reason: unknown, promise) => {
  if (reason instanceof Error) {
    logger.error('CRITICAL: Unhandled Rejection (Error instance):', {
      promise,
      message: reason.message,
      name: reason.name,
      stack: reason.stack,
    });
  } else {
    logger.error('CRITICAL: Unhandled Rejection (Non-Error):', {
      promise,
      reason,
    });
  }
  // Optionally, you might want to exit the process here in a serverless env
  // process.exit(1);
});

process.on('uncaughtException', (error: Error) => {
  logger.error('CRITICAL: Uncaught Exception:', {
    message: error.message,
    name: error.name,
    stack: error.stack,
  });
  // Vercel will likely terminate the function, but logging is key.
  // process.exit(1); // Ensure process exits to signal Vercel function error
});
// --- END Global Error Handlers ---

// Connect to DB using an IIFE
(async () => {
  try {
    await connectDB(config.databaseString);
    console.log('Database connected successfully from app.ts IIFE');
  } catch (error) {
    console.error('Failed to connect to the database from app.ts IIFE:', error);
    // In a serverless environment, the app might still start up and handle
    // requests that don't need a DB, or Vercel might show an error page.
    // It's important to check Vercel logs for this error.
  }
})();

const app: Application = express();

// --- BEGIN Initial Request Logging ---
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(`Incoming Request: ${req.method} ${req.originalUrl}`, {
    headers: req.headers,
    body: req.body,
  });
  next();
});
// --- END Initial Request Logging ---

// Security middleware
app.use(helmet());

// Compression middleware
app.use(compression());

// Request logging
app.use(
  morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
  }),
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: [config.clientUrl || ''], // Default to empty string if not set, as per original
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
};
logger.info('CORS Options Configured:', corsOptions);
app.use(cors(corsOptions));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Root route
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Wallpaper API is Running! 🏃',
    version: process.env.npm_package_version || '1.0.0',
    documentation: '/api-docs',
  });
});

// Apply API key middleware to all API routes
app.use('/v1/api', validateApiKey);

// API routes
app.use('/v1/api/auth', authRoutes);
app.use('/v1/api/wallpapers', wallpaperRoutes);
app.use('/v1/api/categories', categoryRoutes);
app.use('/v1/api/health', healthRouter);
app.use('/v1/api/subscriptions', subscriptionRoutes);
app.use('/v1/api/notifications', notificationRoutes);

// Request timeout handling
app.use((req: Request, res: Response, next: NextFunction) => {
  req.setTimeout(30000, () => {
    const error = new CustomError('Request Timeout', 408);
    next(error);
  });
  next();
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
