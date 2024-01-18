import bluebird from 'bluebird';
import stoppable from 'stoppable';
import { createServer } from 'node:http';
import { createApp } from './app.js';
import { startSocketServer } from './sockets.js';
import { startWorker } from './worker/start.js';
import { Logger } from './utils/logger.js';

const logger = Logger({ name: 'server' });
const PORT = process.env.BACKEND_PORT || 3000;

const expressServer = createServer(createApp(logger));
const worker = startWorker({ targetURL: `${process.env.SIMULATION_URL}:${process.env.SIMULATION_PORT}` });
startSocketServer(expressServer, worker)();

const stoppableServer = stoppable(
  expressServer.listen(PORT, () => {
    logger.info(`Server started on port ${PORT}.`);
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
