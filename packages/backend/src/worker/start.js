import { Worker, isMainThread } from 'node:worker_threads';
import path from 'node:path';
import url from 'node:url';

const workerFilePath = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), 'worker.js');

export const startWorker = workerData => {
  if (!isMainThread) {
    throw new Error('Worker init script is not running on main thread.');
  }

  return new Worker(workerFilePath, { workerData });
};
