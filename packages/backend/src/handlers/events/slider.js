import { SocketEventTypes } from '../../utils/events.js';

export const handler = (logger, targetURL) => async data => {
  logger.info(`Received message on ${SocketEventTypes.DYNAMIC.toUpperCase()}`, { data });
  //
  try {
    logger.info('Propagating slider data to simulation server...');
    const response = await fetch(targetURL);
    logger.info('Response from sim server', { data: response });
    // ...
  } catch (error) {
    logger.error('Retrieving initial config failed', error);
    throw new Error('Retrieving initial config failed', error);
  }
};
