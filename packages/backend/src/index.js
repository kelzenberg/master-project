import bluebird from 'bluebird';
import stoppable from 'stoppable';
import { createServer } from 'node:http';
import { createApp } from './app.js';
import { startSocketServer } from './sockets.js';
import { FetchWorker } from './models/Worker.js';
import { Logger } from './utils/logger.js';

const logger = Logger({ name: 'server' });
const expressPort = process.env.BACKEND_PORT || 3000;
const simServerURL = `http://${process.env.SIMULATION_URL}:${process.env.SIMULATION_PORT}`;
const startURL = `${simServerURL}/start`;
const staticURL = `${simServerURL}/initial`;
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
      logger.info(`Starting sim server...`);
      const startResponse = await fetch(startURL, { method: 'POST' });
      // eslint-disable-next-line unicorn/no-await-expression-member
      const hasStarted = (await startResponse.json()).success;

      if (!hasStarted) {
        const message = 'Python sim could not be started';
        logger.error(message, { hasStarted });
        throw new Error(message);
      }

      logger.info('Python sim has started');
    } catch (error) {
      logger.error(error);
      throw new Error(error);
    }

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
