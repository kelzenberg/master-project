import { Server as SocketIOServer } from 'socket.io';
import { Logger } from './utils/logger.js';
import { SocketEventTypes } from './utils/events.js';
import { clientSetupHandler } from './middlewares/sockets/client-setup-handler.js';
import { roleHandler } from './middlewares/sockets/role-handler.js';
import { errorHandler } from './middlewares/sockets/error-handler.js';
import { getWorkerEventHandlers } from './utils/worker.js';
import { handler as sliderHandler } from './handlers/sockets/slider.js';
import { handler as simIdHandler } from './handlers/sockets/sim-id.js';
import { handler as disconnectHandler } from './handlers/sockets/disconnect.js';

const logger = Logger({ name: 'socket-server' });

export const startSocketServer = (httpServer, simControllers, serverOptions) => {
  const ioServer = new SocketIOServer(httpServer, serverOptions);

  // Packet middlewares
  ioServer.use(clientSetupHandler(logger));
  ioServer.use(roleHandler(logger));
  ioServer.use(errorHandler(logger));

  // Client connection over socket
  ioServer.on('connection', socket => {
    logger.info(`Client connected: ${socket.id}`); // Id is not persisting between session, debug only!

    // Setting client data structure on socket
    socket.data.client = { ...socket.data.client, currentSimUUID: null, currentRoomId: null };

    // Assigning client to correct sim room & sending initial sim data
    socket.on(
      SocketEventTypes.SIM_ID,
      simIdHandler(logger, socket, simControllers, getWorkerEventHandlers(logger, ioServer))
    );

    // Updating Python sim parameters based on client input
    socket.on(SocketEventTypes.SLIDER, sliderHandler(logger, socket, simControllers));

    // Client disconnected event listener
    socket.on(SocketEventTypes.DISCONNECT, disconnectHandler(logger, socket, simControllers));
  });
};
