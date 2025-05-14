import path from 'path';
import winston from 'winston';
import 'winston-daily-rotate-file';

const isProduction = process.env.NODE_ENV === 'production';
const logDir = 'logs'; // Only used for non-production

const loggerTransports: winston.transport[] = [];

if (isProduction) {
  // In production (Vercel), log to console so Vercel can capture it.
  loggerTransports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(), // Keep timestamp for production console logs
        winston.format.json(), // JSON format is good for structured logging
      ),
    }),
  );
} else {
  // In non-production (local development), add file transports and a formatted console transport.
  loggerTransports.push(
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '14d',
    }),
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}`,
        ),
      ),
    }),
  );
}

const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  transports: loggerTransports,
});

export default logger;
