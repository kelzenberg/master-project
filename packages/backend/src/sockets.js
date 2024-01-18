import { Server as SocketIOServer } from 'socket.io';
import { Worker, isMainThread } from 'node:worker_threads';
import path from 'node:path';
import url from 'node:url';
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

  if (process.env.WORKER_ACTIVE == 1 && isMainThread) {
    const workerLogger = Logger({ name: 'worker' });
    const fetchWorker = new Worker(path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), 'worker.js'), {
      workerData: { simURL: `${process.env.SIMULATION_URL}:${process.env.SIMULATION_PORT}` },
    });

    fetchWorker.on('online', () => {
      workerLogger.info(`Worker is alive`);
    });
    fetchWorker.on('message', data => {
      workerLogger.info(`Got worker data: ${data}`);
    });
    fetchWorker.on('error', error => {
      workerLogger.error(`Received worker error`, { error });
    });
    fetchWorker.on('exit', code => {
      if (code !== 0) throw new Error(`Worker stopped with exit code ${code}`);
    });
  }

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
