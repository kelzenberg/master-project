import { Server as SocketIOServer } from 'socket.io';
import { Logger } from './utils/logger.js';
import { SocketEventTypes } from './utils/events.js';
import { handler as messageHandler } from './handlers/events/message.js';

const logger = Logger({ name: 'socket-server' });

export const startSocketServer = (httpServer, serverOptions) => () => {
  const ioServer = new SocketIOServer(httpServer, serverOptions);

  ioServer.on('connection', socket => {
    logger.info('Client connected.');

    // Event listener to log ANY incoming events ("middleware")
    socket.onAny((eventType, ...args) => {
      logger.info(`New socket event on event type: ${`${eventType}`.toUpperCase()}`, { data: args });
    });

    // Custom event listeners
    socket.on(SocketEventTypes.MESSAGE, messageHandler(ioServer));

    // Client disconnect event listener
    socket.on('disconnect', () => logger.info('Client disconnected.'));
  });

  return ioServer;
};
