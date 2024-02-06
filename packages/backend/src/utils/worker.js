import { SocketEventTypes } from './events.js';

export const getWorkerEventHandlers = (logger, ioServer) => ({
  messageHandler: roomId => value => {
    logger.info(
      `Received worker message for room ${roomId}. Emitting message on ${SocketEventTypes.DYNAMIC.toUpperCase()}`
    );
    ioServer.to(roomId).emit(SocketEventTypes.DYNAMIC, value);
  },
  errorHandler:
    (roomId, messageError = false) =>
    error => {
      logger.error(
        `Received worker ${messageError ? 'message ' : ''}error for room ${roomId}. Closing all socket client connections.`,
        {
          error,
        }
      );
      ioServer.in(roomId).disconnectSockets();
    },

  exitHandler: roomId => exitCode => {
    if (exitCode !== 0) {
      const message = `Worker for room ${roomId} stopped with exit code: ${exitCode}. Closing all socket client connections.`;
      logger.error(message);
      ioServer.in(roomId).disconnectSockets();
      throw new Error(message);
    }
  },
});
