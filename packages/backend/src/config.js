import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { v4 as uuid } from 'uuid';
import { Logger } from './utils/logger.js';

const logger = Logger({ name: 'config-loader' });

export const loadConfig = async () => {
  const filePath = path.resolve(`${process.env.CONFIG_PATH}` || './config.json');
  const file = await readFile(filePath, { encoding: 'utf8' });
  const configs = JSON.parse(file);

  if (!configs || configs.length === 0) {
    throw new Error('Config.json is not readable or empty');
  }

  const simulations = {};
  for (const config of configs) {
    const id = uuid();
    simulations[id] = { ...config, id };
  }

  return simulations;
};

export const fetchMissingData = async () => {
  const simConfigs = await loadConfig();

  const updatedSimConfigs = await Promise.all(
    Object.values(simConfigs).map(async value => {
      const { name, simURL, endpoints } = value;

      try {
        logger.info(`Requesting to start ${name} sim...`);

        const startResponse = await fetch(`${simURL}${endpoints.start.path}`, { method: endpoints.start.method });
        // eslint-disable-next-line unicorn/no-await-expression-member
        const hasStarted = (await startResponse.json()).success;

        if (!hasStarted) {
          logger.warn(`Python sim ${name} could not be started. Trying to resume it...`, { hasStarted });
          await fetch(`${simURL}${endpoints.resume.path}`, { method: endpoints.resume.method });
        }

        logger.info(`Python sim ${name} sim has started`);
      } catch (error) {
        logger.error(`Starting Python sim ${name} failed`, error);
        throw new Error(error);
      }

      try {
        logger.info(`Fetching initial data for ${name} sim...`);

        const initialResponse = await fetch(`${simURL}${endpoints.initial.path}`, { method: endpoints.initial.method });
        value.data = { initial: await initialResponse.json() };

        logger.info(`Stored initial config for ${name} sim`);
      } catch (error) {
        logger.error(`Retrieving initial config for ${name} sim failed`, error);
        throw new Error(error);
      }

      return value;
    })
  );

  await writeFile('./test_config.local.json', JSON.stringify(updatedSimConfigs), { encoding: 'utf8' });

  return updatedSimConfigs;
};
