import bluebird from 'bluebird';
import stoppable from 'stoppable';
import { path } from 'node:path';
import { writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { loadSimConfigsFromFile } from './utils/config-loader.js';
import { createSimControllersFromConfigs } from './utils/simulation-factory.js';
import { createApp } from './app.js';
import { startSocketServer } from './sockets.js';
import { Logger } from './utils/logger.js';

const logger = Logger({ name: 'server' });
const expressPort = process.env.BACKEND_PORT || 3000;

const configFilePath = path.resolve(process.env.CONFIG_PATH || 'src/config.json');
const simConfigs = await loadSimConfigsFromFile(configFilePath);
const simInstances = await createSimControllersFromConfigs(simConfigs);

// DEBUG sim configs and instances output to file
if (process.env.NODE_ENV === 'development') {
  await writeFile(
    './config-to-sim-model.local.json',
    JSON.stringify({
      simConfigs,
      simInstances,
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
      await startSocketServer(expressServer, simInstances);
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
