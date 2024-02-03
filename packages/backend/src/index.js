import bluebird from 'bluebird';
import stoppable from 'stoppable';
import path from 'node:path';
import url from 'node:url';
import { writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { createServer as createHttpServer } from 'node:http';
import { createServer as createHttpsServer } from 'node:https';
import {
  loadSimConfigsFromFile,
  createSimControllersFromConfigs,
} from './utils/config-file.js';
import { createApp } from './app.js';
import { startSocketServer } from './sockets.js';
import { Logger } from './utils/logger.js';
import { db } from './services/sqlite.js';

const logger = Logger({ name: 'server' });
const expressPort = process.env.BACKEND_PORT || 3000;

const configFilePath = path.resolve(process.env.CONFIG_PATH || 'src/config.json');
const simConfigs = await loadSimConfigsFromFile(configFilePath);
export const simControllers = await createSimControllersFromConfigs(simConfigs);

const createServer = app => {
  if (process.env.USE_HTTPS === 'true') {
    const certPath = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), 'cert/');
    const options = {
      key: readFileSync(path.resolve(certPath, 'file.pem')),
      cert: readFileSync(path.resolve(certPath, 'file.crt')),
    };
    return createHttpsServer(options, app);
  } else {
    return createHttpServer(app);
  }
};

// DEBUG sim configs and instances output to file
if (process.env.NODE_ENV === 'development') {
  await writeFile(
    './config-to-sim-model.local.json',
    JSON.stringify({
      simConfigs,
      simControllers,
    }),
    { encoding: 'utf8' }
  );
}

// ExpressJS
const expressServer = createServer(createApp(logger));
const stoppableServer = stoppable(
  expressServer.listen(expressPort, async () => {
    logger.info(`Server started on port ${expressPort}.`);

    // Socket.io
    try {
      await startSocketServer(expressServer, simControllers);
    } catch (error) {
      const message = 'Starting socket server failed';
      logger.error(message, error);
      throw new Error(message, error);
    }
  }),
  1000
);

const stopServerAsync = bluebird.promisify(stoppableServer.stop.bind(stoppableServer));

const shutdown = async () => {
  logger.info('Server stopping...');
  await stopServerAsync();
  logger.info('Server stopped.');
};

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
