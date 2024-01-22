import { SocketEventTypes } from '../../utils/events.js';

export const messageHandler = (logger, socket) => value => {
  logger.info(`Received worker message. Emitting message on ${SocketEventTypes.DYNAMIC.toUpperCase()}`);
  socket.emit(SocketEventTypes.DYNAMIC, value);
};

export const errorHandler =
  (logger, socket, message = false) =>
  error => {
    logger.error(`Received worker ${message ? 'message ' : ''}error. Closing socket client connection.`, { error });
    socket.disconnect(true);
  };

export const exitHandler = (logger, socket) => exitCode => {
  if (exitCode !== 0) {
    const message = `Worker stopped with exit code: ${exitCode}. Closing socket client connection.`;
    logger.error(message);

    socket.disconnect(true);
    throw new Error(message);
  }
};
