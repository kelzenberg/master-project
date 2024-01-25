import { SocketEventTypes } from '../../utils/events.js';

export const messageHandler = (logger, ioServer) => value => {
  logger.info(`Received worker message. Emitting message on ${SocketEventTypes.DYNAMIC.toUpperCase()}`);
  ioServer.to(1234).emit(SocketEventTypes.DYNAMIC, value); // ToDo: Room ID
};

export const errorHandler =
  (logger, ioServer, message = false) =>
  error => {
    logger.error(`Received worker ${message ? 'message ' : ''}error. Closing all socket client connections.`, {
      error,
    });
    ioServer.in(1234).disconnectSockets(); // ToDo: Room ID
  };

export const exitHandler = (logger, ioServer) => exitCode => {
  if (exitCode !== 0) {
    const message = `Worker stopped with exit code: ${exitCode}. Closing all socket client connections.`;
    logger.error(message);
    ioServer.in(1234).disconnectSockets(); // ToDo: Room ID
    throw new Error(message);
  }
};
