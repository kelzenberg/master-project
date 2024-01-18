import { parentPort, workerData, isMainThread } from 'node:worker_threads';

const main = () => {
  try {
    let counter = 0;
    for (let i = 0; i < 200; i++) {
      counter++;
    }

    console.log(`From worker: Sim URL "${workerData.simURL}"`);
    parentPort.postMessage(counter);
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

if (!isMainThread) {
  main();
}
