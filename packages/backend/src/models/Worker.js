import { Worker, isMainThread } from 'node:worker_threads';
import path from 'node:path';

/**
 * Fetches a given endpoint URL constantly (loop) in a different NodeJS thread
 * and emits its response when retrieved.
 */
export class FetchWorker {
  #name;
  #URL;
  #isRunning;
  #runFilePath;
  #instance;
  #fetchDelay; // optional

  /**
   * @param {string} name Name of the worker
   * @param {string} URL Address that will be fetched by the worker
   * @param {{fetchDelay: number}} workerOptions Additional worker options, e.g. `fetchDelay` in milliseconds (default `2000`)
   */
  // eslint-disable-next-line unicorn/no-object-as-default-parameter
  constructor(name, URL, workerOptions = { fetchDelay: 2000 }) {
    this.#name = name;
    this.#URL = URL;
    this.#isRunning = false;
    this.#runFilePath = path.resolve(process.env.WORKER_RUN_FILE_PATH || '../worker/main.js');

    // optional
    this.#fetchDelay = Number(process.env.WORKER_DELAY) ?? workerOptions.fetchDelay ?? 2000;
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
