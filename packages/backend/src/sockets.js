import { Server as SocketIOServer } from 'socket.io';
import { Logger } from './utils/logger.js';
import { SocketEventTypes } from './utils/events.js';
// import { handler as dynamicHandler } from './handlers/events/dynamic.js';
import { readDirectoryFiles } from './utils/filereader.js';
import { packetLogger } from './middlewares/events/packet-logger.js';
import { errorHandler } from './middlewares/events/error-handler.js';

const logger = Logger({ name: 'socket-server' });

export const startSocketServer = (httpServer, worker, serverOptions) => () => {
  const ioServer = new SocketIOServer(httpServer, serverOptions);

  // Packet middlewares
  ioServer.use(packetLogger(logger));
  ioServer.use(errorHandler(logger));

  // Client connection over Sockets
  ioServer.on('connection', socket => {
    logger.info(`Client ${socket.id} connected`); // id is not persisting between session, debug only!

    worker.on('online', () => {
      logger.info(`Worker is online`);
    });

    worker.on('message', value => {
      logger.info('Received worker message', { data: value });
    });

    worker.on('error', error => {
      logger.error(`Received worker error`, { error });
    });

    worker.on('messageerror', error => {
      logger.error(`Received worker message error`, { error });
    });

    worker.on('exit', exitCode => {
      if (exitCode !== 0) {
        const message = `Worker stopped with exit code: ${exitCode}`;
        logger.error(message);
        throw new Error(message);
      }
    });

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
