import { delayFor } from '../utils/delay.js';
import { Logger } from '../utils/logger.js';

/**
 * Represents all information of a Python simulation in the cluster
 */
export class Simulation {
  #URL;
  #data;
  #worker;
  #logger;

  name;
  description;
  isHealthy;

  constructor({ name, description, simURL }) {
    this.name = name;
    this.description = description;
    this.#URL = simURL;
    this.#data = { initial: null };
    this.#logger = Logger({ name: `simulation-instance-${this.name}` });
    this.isHealthy = null;
  }

  async #getSimHealth(attempt = 1) {
    this.#logger.info(`Checking health of ${this.name} Python sim (attempt #${attempt})...`);

    try {
      const response = await fetch(`${this.#URL}/health`, { method: 'GET' });
      const { success: isHealthy } = await response.json();
      this.isHealthy = isHealthy;
    } catch (error) {
      const message = `Checking health for ${this.name} sim failed`;
      this.#logger.error(message, error);
      throw new Error(message, error);
    }

    this.#logger[this.isHealthy ? 'info' : 'warn'](
      `Python sim ${this.name} is ${this.isHealthy ? 'healthy' : 'UNHEALTHY'}`
    );
    return this.isHealthy;
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

    this.#logger.info(`Waiting for Python sim ${this.name} to become ready to accept connections...`);
    const isHealthy = await checkHealth();

    if (!isHealthy) {
      const message = `Python sim ${this.name} is not responding healthy after ${repeatCounter} attempts. Aborting...`;
      this.#logger.error(message);
      throw new Error(message);
    }

  }

  async start() {
    this.#logger.info(`Requesting to start ${this.name} Python sim...`);

    try {
      const response = await fetch(`${this.#URL}/start`, { method: 'POST' });
      const { success: hasStarted } = await response.json();

      if (hasStarted) {
        this.#logger.info(`Python sim ${this.name} has started`);
        return true;
      }

      this.#logger.warn(`Python sim ${this.name} could not be started. Trying to reset it...`);
      const hasReset = this.reset();
      return hasReset;
    } catch (error) {
      this.#logger.error(`Starting Python sim ${this.name} failed`, error);
    }

    return false;
  }

  async reset() {
    this.#logger.info(`Requesting to reset ${this.name} Python sim...`);

    try {
      const response = await fetch(`${this.#URL}/reset`, { method: 'POST' });
      const { success: hasReset } = await response.json();

      if (hasReset) {
        this.#logger.info(`Python sim ${this.name} has reset`);
        return true;
      }

      this.#logger.error(`Python sim ${this.name} could not be reset...`);
    } catch (error) {
      this.#logger.error(`Resetting Python sim ${this.name} failed`, error);
    }

    return false;
  }
}
