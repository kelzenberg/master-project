import { parentPort, workerData } from 'node:worker_threads';
import { Logger } from '../utils/logger.js';

const logger = Logger({ name: 'worker' });

const timeout = ms => i => {
  return new Promise(resolve =>
    setTimeout(() => {
      parentPort.postMessage(i);
      resolve();
    }, ms)
  );
};

const main = async () => {
  logger.info(`From worker: Sim URL '${workerData.targetURL}'`);

  try {
    const delay = timeout(2000);
    for (let i = 1; i <= 100; ++i) {
      await delay(i);
    }
  } catch (error) {
    logger.error(error);
    throw new Error(error);
  }
};

await main();
