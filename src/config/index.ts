import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

interface Config {
  port: number;
  databaseString: string;
  clientUrl: string;
  jwtSecret: string;
  apiKey: string;
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };
  googlePlay: {
    clientEmail: string;
    privateKey: string;
  };
}

const config: Config = {
  port: parseInt(process.env.PORT || '5000', 10),
  databaseString: process.env.MONGO_URI || '',
  clientUrl: process.env.CLIENT_URL || '',
  jwtSecret: process.env.ACCESS_TOKEN || '',
  apiKey: process.env.API_KEY || '',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  googlePlay: {
    clientEmail: process.env.GOOGLE_PLAY_CLIENT_EMAIL || '',
    privateKey:
      process.env.GOOGLE_PLAY_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
  },
};

export default config;
