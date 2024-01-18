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

if (process.env.WORKER_ACTIVE == 1) {
  const simURL = `http://${process.env.SIMULATION_URL}:${process.env.SIMULATION_PORT}/${process.env.SIMULATION_ENDPOINT}`;
  const worker = startWorker({ targetURL: simURL });

  startSocketServer(expressServer, worker)();
}

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
