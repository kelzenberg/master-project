import { parentPort, workerData } from 'node:worker_threads';
import { Logger } from '../utils/logger.js';

const logger = Logger({ name: 'fetch-worker' });

const delayFor = ms =>
  new Promise(resolve =>
    setTimeout(() => {
      logger.info(`Delaying script execution for ${ms / 1000} seconds...`);
      resolve();
    }, ms)
  );

const main = async () => {
  const { url, delayTime } = workerData;

  if (!url || `${url}` == '') {
    throw new Error(`Target URL is missing`, { url });
  }

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const response = await fetch(url);
      parentPort.postMessage(await response.json());

      await delayFor(delayTime ?? 0);
    } catch (error) {
      logger.error('Worker failed', error);
      throw new Error(error);
    }
  }
};

await main();
