import { v4 as uuid } from 'uuid';
import { FetchWorker } from './Worker.js';
import { delayFor } from '../utils/delay.js';
import { Logger } from '../utils/logger.js';

/**
 * Represents all information of a Python simulation in the cluster
 */
export class Simulation {
  #URL;
  #isHealthy;
  #data;
  #fetchWorker;
  #logger;

  id;
  title;
  description;
  roomId;
  createdAt;

  constructor({ title, description, envKeyForURL }) {
    this.id = uuid();
    this.title = title;
    this.description = description;
    this.roomId = `sim:${this.id}`;
    this.createdAt = new Date().toISOString();
    this.#URL = `http://${process.env[envKeyForURL + '_URL']}:${process.env.SIMULATION_PORT}`;
    this.#isHealthy = null;
    this.#data = { initial: null };
    this.#fetchWorker = new FetchWorker(`${this.title}-worker`, `${this.#URL}/dynamic`);
    this.#logger = Logger({ name: `${this.title}-simulation-controller` });
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
    const checkHealth = async () => {
      if (repeatCounter >= 5) return false;

      const isHealthy = await this.#getSimHealth(repeatCounter + 1);
      if (isHealthy) return true;

      repeatCounter++;
      await delayFor(1000, this.#logger);

      return await checkHealth();
    };

    this.#logger.info(`Waiting for Python sim ${this.title} to become ready to accept connections...`);
    const isHealthy = await checkHealth();

    if (!isHealthy) {
      const message = `Python sim ${this.title} is not responding healthy after ${repeatCounter} attempts. Aborting...`;
      this.#logger.error(message);
      throw new Error(message);
    }
  }

  async fetchInitialData() {
    try {
      this.#logger.info(`Fetching initial data for ${this.title} sim...`);

      const response = await fetch(`${this.#URL}/initial`, { method: 'GET' });
      this.#data = { initial: await response.json() };

      this.#logger.info(`Stored initial data for ${this.title} sim`);
    } catch (error) {
      const message = `Retrieving initial data for ${this.title} sim failed`;
      this.#logger.error(message, error);
      throw new Error(message, error);
    }
  }

  getInitialData() {
    return this.#data.initial;
  }

  getRunningFetchWorker() {
    if (!this.#fetchWorker.isRunning) return null;
    return this.#fetchWorker;
  }

  #startFetchWorker() {
    if (this.#fetchWorker.isRunning) {
      this.#logger.warn(`Fetch-worker for ${this.title} sim is already running`);
      return;
    }
    this.#fetchWorker.start();
  }

  async start() {
    this.#logger.info(`Requesting to start ${this.title} Python sim...`);

    try {
      const response = await fetch(`${this.#URL}/start`, { method: 'POST' });
      const { success: hasStarted } = await response.json();

      if (hasStarted) {
        this.#logger.info(`Python sim ${this.title} has started`);
        this.#startFetchWorker();
        return true;
      }
    } catch (error) {
      const message = `Starting Python sim ${this.title} failed`;
      this.#logger.error(message, error);
      throw new Error(message, error);
    }

    return false;
  }

  async reset() {
    this.#logger.info(`Requesting to reset ${this.title} Python sim...`);

    try {
      const response = await fetch(`${this.#URL}/reset`, { method: 'POST' });
      const { success: hasReset } = await response.json();

      if (hasReset) {
        this.#logger.info(`Python sim ${this.title} has reset`);

        if (!this.#fetchWorker.isRunning) {
          this.#logger.warn(`Fetch-worker for ${this.title} sim has not been started. Starting now...`);
          this.#startFetchWorker();
        }

        return true;
      }

      this.#logger.error(`Python sim ${this.title} could not be reset...`);
    } catch (error) {
      this.#logger.error(`Resetting Python sim ${this.title} failed`, error);
    }

    return false;
  }

  toJSON() {
    return {
      ...this,
      URL: this.#URL,
      isHealthy: this.#isHealthy,
      data: this.#data,
    };
  }
}
