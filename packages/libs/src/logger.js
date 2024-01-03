import winston from 'winston';

/**
 * Creates a new instance of a winston logger.
 * @param {string} serviceName The name of this service. Example: `@master-project/backend`
 * @param {object} event An object that describes the event the logger should log for. Example: `event: { name: "server-shutdown" }`
 * @returns {winston} A winston logger.
 */
export const createLogger =
  (serviceName = 'master-project') =>
  meta => {
    const logger = winston.createLogger({
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
        event: meta.name ?? 'generic-logger',
        // eslint-disable-next-line no-unused-vars
        meta: (({ name, data, ...rest }) => rest)(meta),
        data: { ...meta.data },
        service: serviceName,
        environment: process.env.NODE_ENV || 'unknown',
      },
      transports: [
        // Write all logs to console
        new winston.transports.Console({ silent: process.env.NO_CONSOLE_LOGGING === 'true' }),
      ],
    });

    if (process.env.NO_FILE_LOGGING !== 'true') {
      logger.add(
        // Write all logs error (and below) to `error.log`.
        new winston.transports.File({ filename: `logs/error.log`, level: 'error' })
      );
      logger.add(
        // Write to all logs with level `info` and below to `combined.log`.
        new winston.transports.File({ filename: `logs/combined.log` })
      );
    }

    return logger;
  };
