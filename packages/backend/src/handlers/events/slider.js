import { SocketEventTypes } from '../../utils/events.js';

export const handler = (logger, url) => async data => {
  logger.info(
    `Received message on ${SocketEventTypes.SLIDER.toUpperCase()}. Propagating data to simulation server...`,
    { data }
  );
  //
  try {
    const response = await fetch(url);
    logger.info('Response from sim server', { data: response });
    // ...
  } catch (error) {
    logger.error('Retrieving initial config failed', error);
    throw new Error('Retrieving initial config failed', error);
  }
};
