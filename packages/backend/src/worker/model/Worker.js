import { Worker, isMainThread } from 'node:worker_threads';
import path from 'node:path';
import url from 'node:url';

export class FetchWorker {
  #name;
  #URL;
  #isRunning;

  #fetchDelay;
  #runFilePath;

  #instance;

  // eslint-disable-next-line unicorn/no-object-as-default-parameter
  constructor(name, URL, workerOptions = { fetchDelay: 2000, runFilePath: '../main.js' }) {
    this.#name = name;
    this.#URL = URL;
    this.#isRunning = false;

    // optionals
    this.#fetchDelay = Number(`${process.env.WORKER_DELAY}`) ?? workerOptions.fetchDelay ?? 2000;
    this.#runFilePath = path.resolve(
      path.dirname(url.fileURLToPath(import.meta.url)),
      workerOptions.runFilePath || '../main.js'
    );
  }

  start() {
    if (process.env.WORKER_ACTIVE != 1) {
      throw new Error("Workers are not enabled in environment, check env variable 'WORKER_ACTIVE'.");
    }
    if (!isMainThread) {
      throw new Error('Worker run script cannot be run outside of main thread.');
    }

    this.#instance = new Worker(this.#runFilePath, {
      name: this.#name,
      workerData: {
        workerName: this.#name,
        URL: this.#URL,
        fetchDelay: this.#fetchDelay,
      },
    });
    this.#isRunning = true;
    return this.#instance;
  }

  stop() {
    this.#isRunning = false;
    if (this.#instance) {
      this.#instance.terminate();
    }
  }

  toJSON() {
    return {
      name: this.#name,
      URL: this.#URL,
      fetchDelay: this.#fetchDelay,
      runFilePath: this.#runFilePath,
      isRunning: this.#isRunning,
    };
  }
}
