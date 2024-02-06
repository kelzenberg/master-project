import { readFile } from 'node:fs/promises';
import { v4 as uuid } from 'uuid';
import { Logger } from './logger.js';
import { db } from '../services/sqlite.js';
import { SimController } from '../controllers/SimController.js';

const logger = Logger({ name: 'simulation-config-loader' });

export const loadSimConfigsFromFile = async filePath => {
  let configs;
  logger.info(`Loading list of configs from file...`, { data: filePath });

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

const findDuplicatesIn = (...keyArrays) => {
  const duplicateMap = new Map();
  const uniqueMap = new Map();

  for (const keyArray of keyArrays) {
    for (const key of keyArray) {
      if (uniqueMap.has(key)) {
        duplicateMap.set(key, key);
      } else {
        uniqueMap.set(key, key);
      }
    }
  }

  return { duplicates: [...duplicateMap.values()], uniques: [...uniqueMap.values()] };
};

const syncDatabaseWithConfigs = async simConfigs => {
  logger.info('Sync database with sim configs...');

  // eslint-disable-next-line unicorn/no-await-expression-member
  const storedEnvKeys = (await db.getAll()).map(config => config.envKeyForURL);
  const loadedEnvKeys = simConfigs.map(config => config.envKeyForURL);
  const { duplicates: noChangeKeys } = findDuplicatesIn(storedEnvKeys, loadedEnvKeys);
  const stats = { removed: 0, inserted: 0 };

  // remove unused stored env keys
  for (const storedKey of storedEnvKeys) {
    if (noChangeKeys.includes(storedKey)) continue;
    stats.removed++;
    await db.deleteOne({ envKeyForURL: storedKey });
  }

  // add new loaded env keys
  for (const loadedKey of loadedEnvKeys) {
    if (noChangeKeys.includes(loadedKey)) continue;
    stats.inserted++;
    await db.upsertOne({ envKeyForURL: loadedKey, uuid: uuid() });
  }

  logger.info('Successfully synced database with sim configs', { data: stats });
};

export const createSimControllersFromConfigs = async simConfigs => {
  await syncDatabaseWithConfigs(simConfigs);

  const storedConfigs = await db.getAll();

  return Promise.all(
    Object.values(simConfigs).map(async loadedConfig => {
      const matchingStoredConfig = storedConfigs.find(
        storedConfig => storedConfig.envKeyForURL === loadedConfig.envKeyForURL
      );

      if (!matchingStoredConfig) {
        const message = `Could not find a matching stored sim config for env key ${loadedConfig.envKeyForURL}`;
        logger.error(message);
        throw new Error(message);
      }

      const simController = new SimController({ ...loadedConfig, ...matchingStoredConfig });
      await simController.waitForSimHealth();
      await simController.fetchInitialSimData();
      return simController;
    })
  );
};
