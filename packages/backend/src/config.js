import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { v4 as uuid } from 'uuid';

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
