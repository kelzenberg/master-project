import { v4 as uuid } from 'uuid';
import path from 'node:path';
import url from 'node:url';
import { readFile, writeFile } from 'node:fs/promises';
import { WorkerController } from './WorkerController.js';
import { delayFor } from '../utils/delay.js';
import { Logger } from '../utils/logger.js';

/**
 * Holds all information about a Python simulation in the cluster
 * and manages the attached fetch workers.
 */
export class SimController {
  id;
  title;
  description;
  roomId;
  isSimRunning;
  createdAt;

  #URL;
  #thumbnail;
  #isHealthy;
  #data;
  #workerController;
  #logger;

  /**
   * @param {{title: string, description: string, envKeyForURL: string}} configObject Data retrieved from simulation configs JSON file
   */
  constructor({ title, description, envKeyForURL, thumbnail }) {
    this.id = uuid();
    this.title = title;
    this.description = description;
    this.roomId = `sim:${this.id}`;
    this.isSimRunning = false;
    this.createdAt = new Date().toISOString();
    this.#URL = `http://${process.env[envKeyForURL + '_URL']}:${process.env.SIMULATION_PORT}`;
    this.#thumbnail = {
      path: path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), `../images/${thumbnail}`),
      encoded: null,
    };
    this.#isHealthy = null;
    this.#data = { initial: null };
    this.#workerController = new WorkerController(`${this.title}-worker`, `${this.#URL}/dynamic`);
    this.#logger = Logger({ name: `${this.title}-simulation-controller` });
  }

  async readThumbnailFromFile() {
    this.#thumbnail.encoded = await readFile(this.#thumbnail.path, { encoding: 'base64' });

    // DEBUG sim configs and instances output to file
    if (process.env.NODE_ENV === 'development') {
      await writeFile(`./thumbnail.${this.title}.local.json`, this.#thumbnail.encoded, { encoding: 'utf8' });
    }
  }

  getThumbnail() {
    if (!this.#thumbnail.encoded) {
      const message = `No thumbnail was created from file for ${this.title} sim`;
      this.#logger.error(message);
      throw new Error(message);
    }

    return this.#thumbnail.encoded;
  }

  async #getSimHealth(attempt = 1) {
    this.#logger.info(`Checking health of ${this.title} Python sim (attempt #${attempt})...`);

    try {
      const response = await fetch(`${this.#URL}/health`, { method: 'GET' });
      const { success: isHealthy } = await response.json();
      this.#isHealthy = isHealthy;
    } catch (error) {
      this.#isHealthy = false;
      const message = `Checking health for ${this.title} sim failed`;
      this.#logger.error(message, error);
      throw new Error(message, error);
    }

    this.#logger[this.#isHealthy ? 'info' : 'warn'](
      `Python sim ${this.title} is ${this.#isHealthy ? 'healthy' : 'UNHEALTHY'}`
    );

    return this.#isHealthy;
  }

  async waitForSimHealth() {
    let repeatCounter = 0;
    const checkHealthDelayed = async () => {
      if (repeatCounter >= 5) return false;

      const isHealthy = await this.#getSimHealth(repeatCounter + 1);
      if (isHealthy) return true;

      repeatCounter++;
      await delayFor(1000, this.#logger);

      return await checkHealthDelayed();
    };

    this.#logger.info(`Waiting for Python sim ${this.title} to become ready to accept connections...`);
    const isHealthy = await checkHealthDelayed();

    if (!isHealthy) {
      const message = `Python sim ${this.title} is responding UNHEALTHY after ${repeatCounter} attempts`;
      this.#logger.error(message);
      throw new Error(message);
    }
  }

  async fetchInitialSimData() {
    this.#logger.info(`Fetching initial data for ${this.title} sim...`);

    try {
      const response = await fetch(`${this.#URL}/initial`, { method: 'GET' });
      this.#data = { initial: await response.json() };

      this.#logger.info(`Stored initial data for ${this.title} sim`);
    } catch (error) {
      const message = `Retrieving initial data for ${this.title} sim failed`;
      this.#logger.error(message, error);
      throw new Error(message, error);
    }
  }

  getInitialSimData() {
    return this.#data.initial;
  }

  async sendSimParameters({ label, value }) {
    this.#logger.info(`Sending updated sim parameters for ${this.title} sim...`);

    const payload = { label: `${label}`, value: `${value}` };
    try {
      const response = await fetch(`${this.#URL}/slider`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const { success: paramsAccepted, reason } = await response.json();

      if (!paramsAccepted) {
        const message = `Python sim ${this.title} is not accepting sent parameters`;
        this.#logger.error(message, { payload, reason });
        throw new Error(message);
      }

      this.#logger.info(`Updated sim parameters for ${this.title} sim`);
    } catch (error) {
      const message = `Sending updated sim parameters for ${this.title} sim failed`;
      this.#logger.error(message, error);
      throw new Error(message, error);
    }
  }

  #startWorker() {
    if (this.#workerController.isWorkerRunning) {
      this.#logger.warn(`Fetch-worker for ${this.title} sim is already running`);
      return;
    }
    this.#workerController.startWorker();
  }

  async #stopWorker() {
    if (!this.#workerController.isWorkerRunning) {
      this.#logger.warn(`Fetch-worker for ${this.title} sim is not running`);
      return;
    }
    await this.#workerController.stopWorker();
  }

  setWorkerEventHandlers({ messageHandler, errorHandler, exitHandler }) {
    const workerInstance = this.#workerController.getWorker();

    if (!workerInstance) {
      const message = `Fetch-worker instance for ${this.title} sim is not available`;
      this.#logger.error(message);
      throw new Error(message);
    }

    workerInstance.on('message', messageHandler(this.roomId));
    workerInstance.on('error', errorHandler(this.roomId));
    workerInstance.on('messageerror', errorHandler(this.roomId, true));
    workerInstance.on('exit', exitHandler(this.roomId));
  }

  async startSim() {
    if (this.isSimRunning) {
      this.#logger.warn(`Python sim ${this.title} is already running`);

      if (!this.#workerController.isWorkerRunning) {
        this.#logger.warn(`Fetch-worker for ${this.title} sim has not been started. Starting now...`);
        this.#startWorker();
      }

      return;
    }

    this.#logger.info(`Requesting to start ${this.title} Python sim...`);

    try {
      const response = await fetch(`${this.#URL}/start`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const { success: hasStarted } = await response.json();

      this.isSimRunning = hasStarted;

      if (!hasStarted) {
        const message = `Python sim ${this.title} returned unsuccessfully on START request`;
        this.#logger.error(message);
        throw new Error(message);
      }

      this.#startWorker();
      const wasRunningBefore = !(response.status === 201);
      this.#logger[wasRunningBefore ? 'warn' : 'info'](
        `Python sim ${this.title} ${wasRunningBefore ? 'is already running' : 'has started'}`
      );
    } catch (error) {
      const message = `Starting Python sim ${this.title} failed`;
      this.#logger.error(message, error);

      this.isSimRunning = false;
      if (this.#workerController.isWorkerRunning) {
        await this.#stopWorker();
      }

      throw new Error(message, error);
    }
  }

  async resetSim() {
    this.#logger.info(`Requesting to reset ${this.title} Python sim...`);

    try {
      const response = await fetch(`${this.#URL}/reset`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const { success: hasReset } = await response.json();

      if (!hasReset) {
        const message = `Python sim ${this.title} returned unsuccessfully on RESET request`;
        this.#logger.error(message);
        throw new Error(message);
      }

      this.#logger.info(`Python sim ${this.title} has reset`);
    } catch (error) {
      const message = `Resetting Python sim ${this.title} failed`;
      this.#logger.error(message, error);

      this.isSimRunning = false;
      if (this.#workerController.isWorkerRunning) {
        await this.#stopWorker();
      }

      throw new Error(message, error);
    }
  }

  toJSON() {
    return {
      ...this,
      URL: this.#URL,
      thumbnail: this.#thumbnail.path,
      isHealthy: this.#isHealthy,
      data: this.#data,
    };
  }
}
