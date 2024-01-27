import { Logger } from '../utils/logger';

/**
 * Represents all information of a Python simulation in the cluster
 */
export class Simulation {
  #name;
  #description;
  #URL;
  #data;
  #worker;
  #logger;

  constructor({ name, description, simURL }) {
    this.#name = name;
    this.#description = description;
    this.#URL = simURL;
    this.#data = { initial: null };
    this.#logger = new Logger({ name: `simulation-instance-${this.#name}` });
  }
}
