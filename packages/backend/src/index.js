import stoppable from 'stoppable';
import bluebird from 'bluebird';
import { createApp } from './app.js';
import { Logger } from './utils/logger.js';

const logger = Logger({ name: 'server' });
const PORT = process.env.BACKEND_PORT || 3000;

const server = stoppable(
  createApp(logger).listen(PORT, () => {
    logger.info(`Server started on port ${PORT}.`);
  }),
  1000
);

const stopServerAsync = bluebird.promisify(server.stop.bind(server));

const shutdown = async () => {
  logger.info('Server stopping...');
  await stopServerAsync();
  logger.info('Server stopped.');
};

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
