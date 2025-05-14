import mongoose from 'mongoose';

export const connectDB = async (url: string) => {
  if (!url) {
    console.log('Please provide a database URI string');
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

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.info('MongoDB reconnected successfully');
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
  } catch (error) {
    console.error(
      `Database Connection Failed: ${
        (error as Error).message || 'An Unknown Error Occurred!'
      }`,
    );
    process.exit(1);
  }
};
