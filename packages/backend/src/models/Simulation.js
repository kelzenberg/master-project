import { delayFor } from '../utils/delay';
import { Logger } from '../utils/logger';

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
    this.#logger = new Logger({ name: `simulation-instance-${this.name}` });
    this.isHealthy = null;
  }

  async #getSimHealth() {
    this.#logger.info(`Checking if ${this.name} Python sim is healthy...`);
    const response = await fetch(`${this.#URL}/start`, { method: 'POST' });
    const { success: isHealthy } = await response.json();

    this.isHealthy = isHealthy;
    this.#logger.info(`Python sim ${this.name} is ${isHealthy ? 'healthy' : 'unhealthy'}...`);
    return isHealthy;
  }

  async waitUntilSimIsHealthy() {
    let repeatCounter = 0;

    const check = async () => {
      if (repeatCounter >= 5) return false;

      const isHealthy = await this.#getSimHealth();
      if (isHealthy) return true;

      repeatCounter++;
      await delayFor(1000, this.#logger);
      await check();
    };

    const isHealthy = check();
    this.#logger[isHealthy ? 'info' : 'error'](`Python sim ${this.name} is ${isHealthy ? 'alive' : 'not available'}`);
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
