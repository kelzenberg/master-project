import { Server as SocketIOServer } from 'socket.io';
import { Logger } from './utils/logger.js';
import { SocketEventTypes } from './utils/events.js';
// import { handler as dynamicHandler } from './handlers/events/dynamic.js';
import { readDirectoryFiles } from './utils/filereader.js';
import { packetLogger } from './middlewares/events/packet-logger.js';
import { errorHandler } from './middlewares/events/error-handler.js';

const logger = Logger({ name: 'socket-server' });

export const startSocketServer = (httpServer, serverOptions) => () => {
  const ioServer = new SocketIOServer(httpServer, serverOptions);

  // Packet middlewares
  ioServer.use(packetLogger(logger));
  ioServer.use(errorHandler(logger));

  // Client connection over Sockets
  ioServer.on('connection', socket => {
    logger.info(`Client ${socket.id} connected`); // id is not persisting between session, debug only!

    // Custom event emitters
    const testJSONData = readDirectoryFiles('./src/data');
    logger.info(`Emitting message on ${SocketEventTypes.INITIAL.toUpperCase()}`);
    socket.emit(SocketEventTypes.INITIAL, testJSONData.initial);

    let count = 1;
    const interval = setInterval(() => {
      if (count > Object.keys(testJSONData).length - 1) {
        clearInterval(interval);
        return;
      }

      logger.info(`Emitting message on ${SocketEventTypes.DYNAMIC.toUpperCase()}`, { data: count });
      socket.emit(SocketEventTypes.DYNAMIC, testJSONData[count]);
      count++;
    }, 2000);

    // Custom event listeners
    // socket.on(SocketEventTypes.DYNAMIC, dynamicHandler(ioServer, logger));

    // Client disconnect event listener
    socket.on('disconnect', () => logger.info('Client disconnected.'));
  });

  return ioServer;
};
