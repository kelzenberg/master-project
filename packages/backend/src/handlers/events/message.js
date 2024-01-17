import { SocketEventTypes } from '../../utils/events.js';

export const handler = (io, logger) => message => {
  logger.info(`Emitting message on ${SocketEventTypes.MESSAGE.toUpperCase()}`, { data: message });
  io.emit(SocketEventTypes.MESSAGE, message);
};
