import bluebird from 'bluebird';
import stoppable from 'stoppable';
import { createServer } from 'node:http';
import { createApp } from './app.js';
import { startSocketServer } from './sockets.js';
import { startWorker } from './worker/start.js';
import { Logger } from './utils/logger.js';

const logger = Logger({ name: 'server' });
const expressPort = process.env.BACKEND_PORT || 3000;
const simServerURL = `http://${process.env.SIMULATION_URL}:${process.env.SIMULATION_PORT}`;
const workerDelay = process.env.WORKER_DELAY ?? 2000;

// ExpressJS
const expressServer = createServer(createApp(logger));
const stoppableServer = stoppable(
  expressServer.listen(expressPort, async () => {
    logger.info(`Server started on port ${expressPort}.`);

    // NodeJS Workers
    let worker;
    if (process.env.WORKER_ACTIVE == 1) {
      worker = startWorker({ targetURL: `${simServerURL}/dynamic`, delayTime: workerDelay });
    }

    // Socket.io
    await startSocketServer(expressServer, { worker, targetURL: `${simServerURL}/static` })();
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
