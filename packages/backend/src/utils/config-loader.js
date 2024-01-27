import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { Logger } from './logger.js';

const logger = Logger({ name: 'simulation-config-loader' });
const filePath = path.resolve(process.env.CONFIG_PATH || 'src/config.json');

const loadSimConfigsFromFile = async path => {
  let configs;
  logger.info(`Loading list of configs from file`, { data: path });

  try {
    const file = await readFile(path, { encoding: 'utf8' });
    configs = JSON.parse(file);
  } catch (error) {
    const message = 'Loading list of configs from file failed';
    logger.error(message, error);
    throw new Error(message, error);
  }

  if (!configs || configs.length === 0) {
    const message = 'List of configs is not defined or empty';
    logger.error(message, { data: { configs, filePath: path } });
    throw new Error(message);
  }

  logger.info('Successfully loaded list of configs');
  return configs;
};

export const getSimulationConfigs = async () => loadSimConfigsFromFile(filePath);
