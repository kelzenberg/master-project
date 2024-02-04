import { WorkerController } from './WorkerController.js';
import { delayFor } from '../utils/delay.js';
import { Logger } from '../utils/logger.js';

/**
 * Holds all information about a Python simulation in the cluster
 * and manages the attached fetch workers.
 */
export class SimController {
  uuid;
  title;
  description;
  roomId;
  isSimRunning;
  createdAt;

  #URL;
  #thumbnailPath;
  #isHealthy;
  #connectedClients;
  #data;
  #workerController;
  #logger;

  /**
   * @param {{title: string, description: string, envKeyForURL: string}} configObject Data retrieved from simulation configs JSON file
   */
  constructor({ uuid, title, description, envKeyForURL, thumbnail }) {
    this.uuid = uuid;
    this.title = title;
    this.description = description;
    this.roomId = `sim:${this.uuid}`;
    this.isSimRunning = false;
    this.createdAt = new Date().toISOString();
    this.#URL = `http://${process.env['URL_' + envKeyForURL]}:${process.env.SIMULATION_PORT}`;
    this.#thumbnailPath = `/images/${thumbnail}`;
    this.#isHealthy = null;
    this.#connectedClients = new Map();
    this.#data = { initial: null };
    this.#workerController = new WorkerController(`${this.title}-worker`, `${this.#URL}/dynamic`);
    this.#logger = Logger({ name: `${this.title}-simulation-controller` });
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
      const { status: statusCode, ok: requestOk } = response;

      if (!requestOk) {
        const message = `Python sim ${this.title} returned unsuccessfully on START request`;
        this.#logger.error(message);
        throw new Error(message);
      }

      const { success } = await response.json();
      const wasNewStart = success && statusCode === 201;
      const isAlreadyRunning = !success && statusCode === 200;
      this.isSimRunning = wasNewStart || isAlreadyRunning;

      if (this.isSimRunning) {
        this.#startWorker();
      }

      this.#logger[wasNewStart ? 'info' : 'warn'](
        `Python sim ${this.title} ${wasNewStart ? 'has started' : 'is already running'}`
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

  async pauseSim() {
    if (!this.isSimRunning) {
      this.#logger.warn(`Python sim ${this.title} is not running`);

      if (this.#workerController.isWorkerRunning) {
        this.#logger.warn(`Fetch-worker for ${this.title} sim is already running. Stopping now...`);
        this.#stopWorker();
      }

      return;
    }

    this.#logger.info(`Requesting to pause ${this.title} Python sim...`);

    try {
      const response = await fetch(`${this.#URL}/pause`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const { status: statusCode, ok: requestOk } = response;

      if (!requestOk) {
        const message = `Python sim ${this.title} returned unsuccessfully on PAUSE request`;
        this.#logger.error(message);
        throw new Error(message);
      }

      const { success } = await response.json();
      const wasNewPaused = success && statusCode === 200;
      const isAlreadyPaused = !success && statusCode === 200;
      this.isSimRunning = !(wasNewPaused || isAlreadyPaused);

      if (!this.isSimRunning) {
        this.#stopWorker();
      }

      this.#logger[wasNewPaused ? 'info' : 'warn'](
        `Python sim ${this.title} ${wasNewPaused ? 'was paused' : 'is already paused'}`
      );
    } catch (error) {
      const message = `Pausing Python sim ${this.title} failed`;
      this.#logger.error(message, error);
      throw new Error(message, error);
    }
  }

  async resumeSim() {
    if (this.isSimRunning) {
      this.#logger.warn(`Python sim ${this.title} is already running`);

      if (!this.#workerController.isWorkerRunning) {
        this.#logger.warn(`Fetch-worker for ${this.title} sim is not running. Starting now...`);
        this.#startWorker();
      }

      return;
    }

    this.#logger.info(`Requesting to resume ${this.title} Python sim...`);

    try {
      const response = await fetch(`${this.#URL}/resume`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const { status: statusCode, ok: requestOk } = response;

      if (!requestOk) {
        const message = `Python sim ${this.title} returned unsuccessfully on RESUME request`;
        this.#logger.error(message);
        throw new Error(message);
      }

      const { success } = await response.json();
      const wasNewResumed = success && statusCode === 200;
      const isAlreadyRunning = !success && statusCode === 200;
      this.isSimRunning = wasNewResumed || isAlreadyRunning;

      if (this.isSimRunning) {
        this.#startWorker();
      }

      this.#logger[wasNewResumed ? 'info' : 'warn'](
        `Python sim ${this.title} ${wasNewResumed ? 'was resumed' : 'is already running'}`
      );
    } catch (error) {
      const message = `Resuming Python sim ${this.title} failed`;
      this.#logger.error(message, error);
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
      const { ok: requestOk } = response;
      const { success } = await response.json();

      if (!requestOk || !success) {
        const message = `Python sim ${this.title} returned unsuccessfully on RESET request`;
        this.#logger.error(message);
        throw new Error(message);
      }

      this.#logger.info(`Python sim ${this.title} has reset`);
    } catch (error) {
      const message = `Resetting Python sim ${this.title} failed`;
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

  getThumbnailPath() {
    return this.#thumbnailPath;
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

  addClient(clientId) {
    if (this.#connectedClients.has(clientId)) {
      this.#logger.warn(`Client ${clientId} has already been added to connected clients`);
      return;
    }

    this.#logger.info(`Adding client ${clientId} to connected clients`);
    this.#connectedClients.set(clientId, clientId);
  }

  removeClient(clientId) {
    if (!this.#connectedClients.has(clientId)) {
      this.#logger.warn(`Client ${clientId} is not listed in connected clients`);
      return;
    }

    this.#logger.info(`Removing client ${clientId} from connected clients`);
    this.#connectedClients.delete(clientId, clientId);
  }

  getClients() {
    return this.#connectedClients.values();
  }

  toJSON() {
    return {
      ...this,
      URL: this.#URL,
      thumbnailPath: this.#thumbnailPath,
      isHealthy: this.#isHealthy,
      data: this.#data,
    };
  }
}
