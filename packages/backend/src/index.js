import bluebird from 'bluebird';
import stoppable from 'stoppable';
import path from 'node:path';
import url from 'node:url';
import { writeFile, readFile } from 'node:fs/promises';
import { createServer as createHttpServer } from 'node:http';
import { createServer as createHttpsServer } from 'node:https';
import { createApp } from './app.js';
import { startSocketServer } from './sockets.js';
import { db } from './services/sqlite.js';
import { Logger } from './utils/logger.js';
import { loadSimConfigsFromFile, createSimControllersFromConfigs } from './utils/config-file.js';
import { checkIfEnvValuesExist } from './utils/env-values.js';

const logger = Logger({ name: 'server' });
checkIfEnvValuesExist(logger);
db.initialize();

// Reading simulation configs file & initiating SimController for them
const configFilePath = path.resolve(process.env.CONFIG_PATH || 'src/config.json');
const simConfigs = await loadSimConfigsFromFile(configFilePath);
export const simControllers = await createSimControllersFromConfigs(simConfigs);

// [DEBUG] sim configs and instances are outputted to file
if (process.env.NODE_ENV === 'development') {
  await writeFile(
    './config-to-sim-controller.local.json',
    JSON.stringify(
      {
        input: simConfigs,
        output: simControllers,
      },
      null,
      2
    ),
    { encoding: 'utf8' }
  );
}

// check HTTP(S) mode & create matching HTTP(S) server
const createServer = async app => {
  if (process.env.USE_HTTPS === 'true') {
    const certPath = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), './cert/');
    logger.info(`Server running in HTTPS mode, reading certificate files from '${certPath}'`);

    try {
      const options = {
        key: await readFile(path.resolve(certPath, 'file.pem')),
        cert: await readFile(path.resolve(certPath, 'file.crt')),
      };

      return createHttpsServer(options, app);
    } catch (error) {
      const message = `Could not create HTTPS server with certificates from '${certPath}'`;
      logger.error(message, error);
      throw new Error(message, error);
    }
  } else {
    return createHttpServer(app);
  }
};

// ExpressJS
const expressPort = process.env.BACKEND_PORT || 3000;
const expressServer = await createServer(createApp(logger));
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

// Graceful shutdown --> Add server components to shutdown here
const shutdown = async () => {
  logger.info('Server and services stopping...');
  await Promise.resolve(simControllers.map(async controller => controller.pauseSim()));
  await stopServerAsync();
  await db.close();
  logger.info('Server and services stopped.');
};

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
