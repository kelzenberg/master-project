import { SocketEventTypes } from '../../utils/events.js';

export const handler = (io, logger) => message => {
  logger.info(`Receiving message on ${SocketEventTypes.DYNAMIC.toUpperCase()}`, { data: message });
};
