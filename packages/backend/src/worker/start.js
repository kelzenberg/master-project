import { Worker, isMainThread } from 'node:worker_threads';
import path from 'node:path';
import url from 'node:url';

const workerFilePath = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), 'worker.js');

export const startWorker = workerData => {
  if (process.env.WORKER_ACTIVE == 1 && isMainThread) {
    return new Worker(workerFilePath, { workerData });
  } else {
    // eslint-disable-next-line no-console
    console.warn(`Worker did not start. WORKER_ACTIVE? ${process.env.WORKER_ACTIVE}, isMainThread? ${isMainThread}`);
  }
};
