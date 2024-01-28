import { readFile } from 'node:fs/promises';
import { Logger } from './logger.js';

const logger = Logger({ name: 'simulation-config-loader' });

export const loadSimConfigsFromFile = async filePath => {
  let configs;
  logger.info(`Loading list of configs from file`, { data: filePath });

  try {
    const file = await readFile(filePath, { encoding: 'utf8' });
    configs = JSON.parse(file);
  } catch (error) {
    const message = 'Loading list of configs from file failed';
    logger.error(message, error);
    throw new Error(message, error);
  }

  if (!configs || configs.length === 0) {
    const message = 'List of configs is not defined or empty';
    logger.error(message, { data: { configs, filePath: filePath } });
    throw new Error(message);
  }

  logger.info('Successfully loaded list of configs');
  return configs;
};
