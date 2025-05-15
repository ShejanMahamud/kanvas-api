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
  } catch (error) {
    console.error('Failed to connect to the database from app.ts IIFE:', error);
    // In a serverless environment, the app might still start up and handle
    // requests that don't need a DB, or Vercel might show an error page.
    // It's important to check Vercel logs for this error.
  }
})();

const app: Application = express();

// Trust the first hop for X-Forwarded-For header (Vercel proxy)
// This is important for express-rate-limit and other IP-dependent middleware.
app.set('trust proxy', 1);

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

// Root route
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Wallpaper API is Running! 🏃',
    version: process.env.npm_package_version || '1.0.0',
    documentation: '/api-docs',
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API routes
app.use('/v1/api/auth',validateApiKey, authRoutes);
app.use('/v1/api/wallpapers',validateApiKey, wallpaperRoutes);
app.use('/v1/api/categories',validateApiKey, categoryRoutes);
app.use('/v1/api/health',validateApiKey, healthRouter);
app.use('/v1/api/subscriptions', validateApiKey,subscriptionRoutes);
app.use('/v1/api/notifications', validateApiKey,notificationRoutes);

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

// Start the server only if not in a serverless environment (e.g., local development)
// Vercel handles the server listening part automatically for the exported app.
if (
  process.env.VERCEL_ENV !== 'production' &&
  process.env.NODE_ENV !== 'production'
) {
  const port = config.port;
  app.listen(port, () => {
    logger.info(`🚀 Server is running locally on http://localhost:${port}`);
    logger.info(
      `📚 API documentation available at http://localhost:${port}/api-docs`,
    );
  });
}

export default app;
