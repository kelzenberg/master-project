import { parentPort, workerData } from 'node:worker_threads';
import { Logger } from '../utils/logger.js';

const logger = Logger({ name: 'worker' });

const delayFor = ms =>
  new Promise(resolve =>
    setTimeout(() => {
      console.log(`Waiting for ${ms / 1000} seconds...`);
      resolve();
    }, ms)
  );

const main = async () => {
  logger.info(`From worker: Sim URL '${workerData.targetURL}'`);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const response = await fetch(workerData.targetURL);
      parentPort.postMessage(await response.json());
      await delayFor(2000);
    } catch (error) {
      logger.error(error);
      throw new Error(error);
    }
  }
};

await main();
