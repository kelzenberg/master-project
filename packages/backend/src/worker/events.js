import { SocketEventTypes } from '../utils/events.js';

export const messageHandler = (ioLogger, ioServer, roomId) => value => {
  ioLogger.info(`Received worker message. Emitting message on ${SocketEventTypes.DYNAMIC.toUpperCase()}`);
  ioServer.to(roomId).emit(SocketEventTypes.DYNAMIC, value);
};

export const errorHandler =
  (ioLogger, ioServer, roomId, messageError = false) =>
  error => {
    ioLogger.error(`Received worker ${messageError ? 'message ' : ''}error. Closing all socket client connections.`, {
      error,
    });
    ioServer.in(roomId).disconnectSockets();
  };

export const exitHandler = (ioLogger, ioServer, roomId) => exitCode => {
  if (exitCode !== 0) {
    const message = `Worker stopped with exit code: ${exitCode}. Closing all socket client connections.`;
    ioLogger.error(message);
    ioServer.in(roomId).disconnectSockets();
    throw new Error(message);
  }
};
