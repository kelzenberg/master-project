import stoppable from 'stoppable';
import bluebird from 'bluebird';
import { createApp } from './app.js';
import { Logger } from './utils/logger.js';

const logger = Logger({ name: 'server' });

const server = stoppable(
  createApp().listen(3000, () => {
    logger.info('Server started.');
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
