import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'node:http';
import { createApp } from './app.js';
import stoppable from 'stoppable';
import bluebird from 'bluebird';
import { Logger } from './utils/logger.js';

const logger = Logger({ name: 'server' });
const PORT = process.env.BACKEND_PORT || 3000;

const httpServer = createServer(createApp(logger));
export const socketServer = new SocketIOServer(httpServer);

socketServer.on('connection', socket => {
  logger.info('Connection received.');
  socket.on('disconnect', () => logger.info('Connection terminated.'));
});

const stoppableServer = stoppable(
  httpServer.listen(PORT, () => {
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
