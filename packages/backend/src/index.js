import bluebird from 'bluebird';
import stoppable from 'stoppable';
import { createServer } from 'node:http';
import { createApp } from './app.js';
import { startSocketServer } from './sockets.js';
import { FetchWorker } from './models/Worker.js';
import { Logger } from './utils/logger.js';
import { fetchMissingData } from './config.js';

const logger = Logger({ name: 'server' });
const expressPort = process.env.BACKEND_PORT || 3000;
const simServerURL = `http://${process.env.SIMULATION_URL}:${process.env.SIMULATION_PORT}`;
const startURL = `${simServerURL}/start`;
const resumeURL = `${simServerURL}/resume`;
const staticURL = `${simServerURL}/initial`;
const dynamicURL = `${simServerURL}/dynamic`;
const sliderURL = `${simServerURL}/slider`;

const data = await fetchMissingData();

// ExpressJS
const expressServer = createServer(createApp(logger));
const stoppableServer = stoppable(
  expressServer.listen(expressPort, async () => {
    logger.info(`Server started on port ${expressPort}.`);

    try {
      // NodeJS Workers
      const methanationWorker = new FetchWorker('Methanation', dynamicURL);

      // Socket.io
      await startSocketServer(expressServer, { fetchWorker: methanationWorker.start(), url: sliderURL, simList })();
    } catch (error) {
      logger.error(error);
      throw error;
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
