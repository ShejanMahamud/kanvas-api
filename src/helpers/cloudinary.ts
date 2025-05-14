import { UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';
import cloudinary from '../config/cloudinary';
import logger from '../utils/logger';

interface UploadOptions {
  folder?: string;
  transformation?: Array<Record<string, string | number | boolean>>;
}

interface TransformationOptions {
  quality?: string;
  fetch_format?: string;
  dpr?: string;
  width?: number;
  height?: number;
  crop?: string;
}

export const uploadToCloudinary = async (
  file: Express.Multer.File,
  options: UploadOptions = {},
): Promise<UploadApiResponse> => {
  const { folder = 'wallpapers', transformation = [] } = options;

  // Default transformations for optimization
  const defaultTransformations: TransformationOptions[] = [
    { quality: 'auto:best' }, // Best quality while maintaining reasonable file size
    { fetch_format: 'auto' }, // Automatic format selection
    { dpr: 'auto' }, // Automatic device pixel ratio
  ];

  // Combine default and custom transformations
  const finalTransformations = [...defaultTransformations, ...transformation];

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        transformation: finalTransformations,
        eager: [
          // Generate a thumbnail immediately
          {
            width: 400,
            height: 225,
            crop: 'fill',
            quality: 'auto:good',
          },
        ],
        eager_async: true,
      },
      (error, result) => {
        if (error) {
          logger.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          logger.info('Cloudinary upload successful:', result?.public_id);
          resolve(result as UploadApiResponse);
        }
      },
    );

    // Convert buffer to stream and upload
    const bufferStream = Readable.from(file.buffer);
    bufferStream.pipe(uploadStream);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    logger.info('Cloudinary deletion successful:', publicId);
    return result;
  } catch (error) {
    logger.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

export const generateOptimizedUrl = (
  publicId: string,
  options: TransformationOptions = {},
): string => {
  const {
    width,
    height,
    quality = 'auto:good',
    fetch_format = 'auto',
    crop = 'fill',
  } = options;

  const transformation: TransformationOptions[] = [
    { quality },
    { fetch_format },
    { dpr: 'auto' },
  ];

  if (width) transformation.push({ width });
  if (height) transformation.push({ height });
  if (crop) transformation.push({ crop });

  return cloudinary.url(publicId, {
    transformation,
    secure: true,
  });
};
