import { parentPort, workerData } from 'node:worker_threads';
import { Logger } from '../utils/logger.js';

const { workerName, URL, fetchDelay } = workerData;
const logger = Logger({ name: `fetch-worker-${workerName.toLowerCase()}` });

const delayFor = ms =>
  new Promise(resolve =>
    setTimeout(() => {
      logger.debug(`Delaying script execution for ${ms / 1000} seconds...`);
      resolve();
    }, ms)
  );

const main = async () => {
  if (!URL || `${URL}` == '') {
    throw new Error(`Target URL is missing`, { url: URL });
  }

  logger.info(`Starting '${workerName}' worker loop to fetch URL '${URL}' every ${fetchDelay} milliseconds`);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const response = await fetch(URL);
      parentPort.postMessage(await response.json());

      await delayFor(fetchDelay ?? 0);
    } catch (error) {
      logger.error('Worker failed', error);
      throw new Error(error);
    }
  }
};

await main();
