import mongoose from 'mongoose';
import logger from '../utils/logger';

export const connectDB = async (url: string) => {
  if (!url) {
    console.log('Please provide a database URI string');
    logger.error(
      'CRITICAL: Database URI string is not provided. Exiting process.',
    );
    process.exit(1);
  }

  const options = {
    maxPoolSize: 10, // Maximum number of connections in the pool
    minPoolSize: 5, // Minimum number of connections in the pool
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
    serverSelectionTimeoutMS: 10000, // Keep trying to send operations for 10 seconds
    heartbeatFrequencyMS: 10000, // Check server status every 10 seconds
  };

  try {
    await mongoose.connect(url, options);
    console.log('Database connection established!');
    logger.info(
      'Database connection established successfully via mongoose.connect.',
    );

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error event:', {
        message: err.message,
        stack: err.stack,
        error: err,
      });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn(
        'MongoDB disconnected. Mongoose will attempt to reconnect if configured.',
      );
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected successfully.');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        console.error('Error during MongoDB connection closure:', err);
        process.exit(1);
      }
    });
  } catch (error: any) {
    logger.error(
      'CRITICAL: Database Connection Failed during initial mongoose.connect attempt.',
      {
        message: error.message,
        name: error.name,
        stack: error.stack,
        errorDetails: error,
      },
    );
    process.exit(1);
  }
};
