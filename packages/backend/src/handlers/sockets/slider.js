import { SocketEventTypes } from '../../utils/events.js';

export const handler = (logger, url) => async data => {
  const payload = { name: `${data.label}`, value: `${data.value}` };
  logger.info(
    `Received message on ${SocketEventTypes.SLIDER.toUpperCase()}. Propagating data to simulation server...`,
    { data: { received: data, payload } }
  );

  try {
    const response = await fetch(url, { method: 'POST', body: JSON.stringify(payload) });
    const responseData = await response.json();
    logger.info('Response from simulation server', { data: responseData });
  } catch (error) {
    logger.error('Sending updated slider values failed', error, { payload });
    throw new Error('Sending updated slider values failed', error, { payload });
  }
};
