import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { v4 as uuid } from 'uuid';
import { Logger } from './logger.js';

const logger = Logger({ name: 'simulation-config-loader' });
const filePath = path.resolve(`${process.env.CONFIG_PATH}` || '../config.json');

const loadConfigsFromFile = async path => {
  let configs;
  logger.info(`Loading list of configs from file path: ${path}`, { data: path });

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

  logger.info('Successfully loaded list of configs', { data: path });
  return configs;
};

const mapIDsOnConfigs = configs => {
  const configsMap = {};

  for (const config of configs) {
    const id = uuid();
    configsMap[id] = { ...config, id };
  }

  logger.info('Assigned each config a unique ID', { data: Object.keys(configsMap) });
  return configsMap;
};

export const getSimulationConfigs = async () => {
  const configs = await loadConfigsFromFile(filePath);
  const configsMap = await mapIDsOnConfigs(configs);

  return configsMap;
};
