import bluebird from 'bluebird';
import stoppable from 'stoppable';
import { createServer } from 'node:http';
import { createApp } from './app.js';
import { startSocketServer } from './sockets.js';
import { FetchWorker } from './worker/model/Worker.js';
import { Logger } from './utils/logger.js';

const logger = Logger({ name: 'server' });
const expressPort = process.env.BACKEND_PORT || 3000;
const simServerURL = `http://${process.env.SIMULATION_URL}:${process.env.SIMULATION_PORT}`;
const staticURL = `${simServerURL}/static`;
const dynamicURL = `${simServerURL}/dynamic`;
const sliderURL = `${simServerURL}/slider`;

// ExpressJS
const expressServer = createServer(createApp(logger));
const stoppableServer = stoppable(
  expressServer.listen(expressPort, async () => {
    logger.info(`Server started on port ${expressPort}.`);

    // ToDo: this is placed temporarily here until the backend knows all simulations, their URLs
    // and has an option to dynamically get and store the initial sim data
    let initialData;
    try {
      logger.info(`Fetching initial data...`);
      const response = await fetch(staticURL);
      initialData = await response.json();
      logger.info(`Received initial data...`);
    } catch (error) {
      logger.error('Retrieving initial config failed', error);
      throw new Error('Retrieving initial config failed', error);
    }

    try {
      // NodeJS Workers
      const methanationWorker = new FetchWorker('Methanation', dynamicURL);

      // Socket.io
      await startSocketServer(expressServer, { fetchWorker: methanationWorker.start(), url: sliderURL, initialData })();
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
