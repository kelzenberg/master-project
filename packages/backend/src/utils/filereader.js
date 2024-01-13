import fs from 'node:fs';
import path from 'node:path';
import { Logger } from './logger.js';

const logger = Logger({ name: 'file-reader' });

export const readDirectoryFiles = directory => {
  const fileNames = fs.readdirSync(directory, { encoding: 'utf8' });
  logger.info(`Reading ${fileNames.length} files from directory ${directory}`);
  // eslint-disable-next-line unicorn/no-array-reduce
  const files = fileNames.reduce(
    (prev, curr) => ({
      [`${curr}`.split('.')[0]]: JSON.parse(fs.readFileSync(path.join(directory, curr), { encoding: 'utf8' })),
      ...prev,
    }),
    {}
  );
  logger.info(`Read ${Object.keys(files).length} files titled "${Object.keys(files)}"`);
};
