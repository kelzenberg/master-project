import { Worker, isMainThread } from 'node:worker_threads';
import path from 'node:path';
import { Logger } from '../utils/logger.js';

/**
 * Fetches a given endpoint URL constantly (loop) in a different NodeJS thread
 * and emits its response when retrieved.
 */
export class FetchWorker {
  title;
  isRunning;
  #URL;
  #runFilePath;
  #instance;
  #logger;
  #fetchDelay;

  /**
   * @param {string} title Title of the worker
   * @param {string} URL Address that will be fetched by the worker
   * @param {{fetchDelay: number}} workerOptions Additional worker options, e.g. `fetchDelay` in milliseconds (default `2000`)
   */
  // eslint-disable-next-line unicorn/no-object-as-default-parameter
  constructor(title, URL, workerOptions = { fetchDelay: 2000 }) {
    this.title = title;
    this.isRunning = false;
    this.#URL = URL;
    this.#runFilePath = path.resolve(process.env.WORKER_RUN_FILE_PATH || '../worker/main.js');
    this.#instance = null;
    this.#logger = Logger({ name: `${this.title}-controller` });
    this.#fetchDelay = Number(process.env.WORKER_DELAY) ?? workerOptions.fetchDelay ?? 2000;
  }

  start() {
    if (process.env.WORKER_ACTIVE != 1) {
      const message = "Workers are not enabled in environment, set environment variable 'WORKER_ACTIVE' to 1";
      this.#logger.error(message);
      throw new Error(message);
    }
    if (!isMainThread) {
      const message = 'Worker run script cannot be run outside of main thread';
      this.#logger.error(message);
      throw new Error(message);
    }

    this.#logger.info(`Starting ${this.title} instance...`);
    this.#instance = new Worker(this.#runFilePath, {
      name: this.title,
      workerData: {
        workerName: this.title,
        URL: this.#URL,
        fetchDelay: this.#fetchDelay,
      },
    });
    this.isRunning = true;
  }

  async stop() {
    this.#logger.info(`Stopping ${this.title} instance...`);

    if (this.#instance) {
      await this.#instance.terminate();
      this.isRunning = false;
      this.#instance = null;
      this.#logger.info(`Successfully stopped ${this.title} instance...`);
    }
  }

  toJSON() {
    return {
      ...this,
      URL: this.#URL,
      runFilePath: this.#runFilePath,
      fetchDelay: this.#fetchDelay,
    };
  }
}
