import { readFile, writeFile } from 'node:fs/promises';
import { v4 as uuid } from 'uuid';
import { Logger } from './logger.js';
import { SimController } from '../controllers/SimController.js';

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

export const updateSimConfigsFileWithIds = async (filePath, configs) => {
  logger.info(`Writing list of updated configs to file`, { data: filePath });

  const updatedConfigs = configs.map(config => {
    if (!config.databaseId || config.databaseId.trim() === '') {
      config.databaseId = uuid();
      logger.info(`Updated config ${config.title} (${config.envKeyForURL})`);
    }
    return config;
  });

  try {
    await writeFile(filePath, JSON.stringify(updatedConfigs), { encoding: 'utf8' });
  } catch (error) {
    const message = 'Writing list of updated configs to file failed';
    logger.error(message, error);
    throw new Error(message, error);
  }

  logger.info('Successfully updated list of configs in file');
  return updatedConfigs;
};

export const createSimControllersFromConfigs = async simConfigs =>
  Promise.all(
    Object.values(simConfigs).map(async simConfig => {
      const simController = new SimController({ ...simConfig });
      await simController.waitForSimHealth();
      await simController.fetchInitialSimData();
      return simController;
    })
  );
