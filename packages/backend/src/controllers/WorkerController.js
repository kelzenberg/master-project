import { Worker, isMainThread } from 'node:worker_threads';
import path from 'node:path';
import { Logger } from '../utils/logger.js';

/**
 * Creates a worker in a NodeJS thread that fetches a given endpoint URL constantly (loop)
 * and emits the endpoint's response when successfully retrieved.
 */
export class WorkerController {
  title;
  isWorkerRunning;
  #URL;
  #runFilePath;
  #worker;
  #fetchDelay;
  #logger;

  /**
   * @param {string} title Title of the worker
   * @param {string} URL Address that will be fetched by the worker
   * @param {{fetchDelay: number}} workerOptions Additional worker options, e.g. `fetchDelay` in milliseconds (default `2000`)
   */
  // eslint-disable-next-line unicorn/no-object-as-default-parameter
  constructor(title, URL, workerOptions = { fetchDelay: 2000 }) {
    this.title = title;
    this.isWorkerRunning = false;
    this.#URL = URL;
    this.#runFilePath = path.resolve(process.env.WORKER_RUN_FILE_PATH || '../worker/main.js');
    this.#worker = null;
    this.#fetchDelay = Number(process.env.WORKER_DELAY) ?? workerOptions.fetchDelay ?? 2000;
    this.#logger = Logger({ name: `${this.title}-controller` });
  }

  getWorker() {
    return this.isWorkerRunning ? this.#worker : null;
  }

  startWorker() {
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
    if (this.isWorkerRunning) {
      this.#logger.warn(`${this.title} worker is already running`);
      return;
    }

    this.#logger.info(`Starting ${this.title} worker...`);
    this.#worker = new Worker(this.#runFilePath, {
      name: this.title,
      workerData: {
        workerName: this.title,
        URL: this.#URL,
        fetchDelay: this.#fetchDelay,
      },
    });
    this.isWorkerRunning = true;
    this.#logger.info(`Successfully started ${this.title} worker`);
  }

  async stopWorker() {
    if (!this.#worker) {
      this.#logger.warn(`No ${this.title} worker exists`);
      return;
    }
    if (!this.isWorkerRunning) {
      this.#logger.warn(`${this.title} worker is not running`);
      return;
    }

    this.#logger.info(`Stopping ${this.title} worker...`);
    await this.#worker.terminate();
    this.#worker = null;
    this.isWorkerRunning = false;
    this.#logger.info(`Successfully stopped ${this.title} worker`);
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
