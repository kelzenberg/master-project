import { Server as SocketIOServer } from 'socket.io';
import { Logger } from './utils/logger.js';
import { SocketEventTypes } from './utils/events.js';
import { handler as messageHandler } from './handlers/events/message.js';
import { readDirectoryFiles } from './utils/filereader.js';

const logger = Logger({ name: 'socket-server' });

export const startSocketServer = (httpServer, serverOptions) => () => {
  const ioServer = new SocketIOServer(httpServer, serverOptions);

  ioServer.on('connection', socket => {
    logger.info('Client connected.');

    const testJSONData = readDirectoryFiles('./src/data');
    logger.info(logger.info(`Emitting message on ${SocketEventTypes.INIT}`, testJSONData));
    socket.emit(SocketEventTypes.INIT, testJSONData.initial);

    // Event listener to log ANY incoming events ("middleware")
    socket.onAny((eventType, ...args) => {
      logger.info(`New socket event on event type: ${`${eventType}`.toUpperCase()}`, { data: args });
    });

    // Custom event listeners
    socket.on(SocketEventTypes.MESSAGE, messageHandler(ioServer, logger));

    // Client disconnect event listener
    socket.on('disconnect', () => logger.info('Client disconnected.'));
  });

  return ioServer;
};
