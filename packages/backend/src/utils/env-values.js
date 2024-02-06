const envValues = [
  'NODE_ENV',
  'USE_HTTPS',
  'NO_CONSOLE_LOGGING',
  'NO_FILE_LOGGING',
  'BACKEND_PORT',
  'API_KEY_DEV',
  'WORKER_ACTIVE',
  'WORKER_DELAY',
  'WORKER_RUN_FILE_PATH',
  'CONFIG_PATH',
  'SIMULATION_PORT',
];

export const checkIfEnvValuesExist = logger => {
  const errors = [];
  for (const value of envValues) {
    try {
      const envValue = process.env[value];
      if (!envValue || `${envValue}`.trim() === '') throw new Error(`${value} is empty`);
    } catch {
      errors.push(value);
    }
  }

  if (errors.length > 0) {
    const message = `Missing ${errors.length} environment variable(s) to start the application: [ ${errors} ]`;
    const error = { missing: errors };
    logger.error(message, { error });
    throw new Error(message, error);
  }

  logger.info(`Successfully loaded all ${envValues.length} required environment variables`);
};
