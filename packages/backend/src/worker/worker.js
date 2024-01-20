import { parentPort, workerData } from 'node:worker_threads';
import { Logger } from '../utils/logger.js';

const logger = Logger({ name: 'worker' });

const delayFor = ms =>
  new Promise(resolve =>
    setTimeout(() => {
      logger.info(`Delaying script execution for ${ms / 1000} seconds...`);
      resolve();
    }, ms)
  );

const main = async () => {
  const { targetURL, delayTime } = workerData;

  if (!targetURL || `${targetURL}` == '') {
    throw new Error(`TargetURL is missing`, { targetURL });
  }

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const response = await fetch(targetURL);
      parentPort.postMessage(await response.json());

      await delayFor(delayTime ?? 0);
    } catch (error) {
      logger.error('Worker failed', error);
      throw new Error(error);
    }
  }
};

await main();
