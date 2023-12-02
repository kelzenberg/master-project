import winston from 'winston';

/**
 * Creates a new instance of a winston logger.
 * @param {string} serviceName The name of this service. Example: `@master-project/backend`
 * @param {object} event An object that describes the event the logger should log for. Example: `event: { name: "server-shutdown" }`
 * @returns {winston} A winston logger.
 */
export const createLogger =
  (serviceName = 'master-project') =>
  event =>
    winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
      ),
      defaultMeta: {
        service: serviceName,
        environment: process.env.NODE_ENV || 'unknown',
        event: { name: 'generic name', ...event },
      },
      transports: [
        // Write all logs error (and below) to `error.log`.
        new winston.transports.File({ filename: `${serviceName}.error.log`, level: 'error' }),
        // Write to all logs with level `info` and below to `combined.log`.
        new winston.transports.File({ filename: `${serviceName}.combined.log` }),
        // Write all logs
        new winston.transports.Console({ silent: process.env.NO_LOGGING === 'true' }),
      ],
    });
