import { parentPort, workerData } from 'node:worker_threads';
import { Logger } from '../utils/logger.js';
import { delayFor } from '../utils/delay.js';

const { workerName, URL, fetchDelay } = workerData;
const logger = Logger({ name: workerName });

const main = async () => {
  if (!URL || `${URL}` == '') {
    const message = `Target URL is missing`;
    logger.error(message);
    throw new Error(message, { url: URL });
  }

  logger.info(`Starting ${workerName} worker loop to fetch URL '${URL}' every ${fetchDelay} milliseconds...`);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const response = await fetch(URL);
      const payload = await response.json();
      parentPort.postMessage(payload);

      logger.debug('Fetched data from target URL', { data: { workerName, URL, fetchDelay, payload } });

      await delayFor(fetchDelay ?? 0, logger);
    } catch (error) {
      const message = 'Worker failed fetching data or sending it to parent process';
      logger.error(message, error);
      throw new Error(message, error);
    }
  }
};

await main();
