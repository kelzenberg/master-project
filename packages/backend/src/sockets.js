import { Server as SocketIOServer } from 'socket.io';
import { Logger } from './utils/logger.js';
import { SocketEventTypes } from './utils/events.js';
import { errorHandler } from './middlewares/sockets/error-handler.js';
import { getFetchWorkerCallbacks } from './utils/worker.js';
import { handler as sliderHandler } from './handlers/sockets/slider.js';
import { handler as simIdHandler } from './handlers/sockets/sim-id.js';

const logger = Logger({ name: 'socket-server' });

export const startSocketServer = (httpServer, simControllers, serverOptions) => {
  const ioServer = new SocketIOServer(httpServer, serverOptions);

  // Packet middlewares
  ioServer.use(errorHandler(logger));

  // Client connection over socket
  ioServer.on('connection', socket => {
    logger.info(`Client connected: ${socket.id}`); // Id is not persisting between session, debug only!

    // Setting client data structure on socket
    socket.data.client = { currentSimUUID: null, currentRoomId: null };

    // Assigning client to correct sim room & sending initial sim data
    socket.on(
      SocketEventTypes.SIM_ID,
      simIdHandler(logger, socket, simControllers, getFetchWorkerCallbacks(logger, ioServer))
    );

    // Updating Python sim parameters based on client input
    socket.on(SocketEventTypes.SLIDER, sliderHandler(logger, socket, simControllers));

    // Client disconnected event listener
    socket.on('disconnect', () => logger.info(`Client disconnected: ${socket.id}`));
  });
};
