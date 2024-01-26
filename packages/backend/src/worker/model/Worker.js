import { Worker, isMainThread } from 'node:worker_threads';
import path from 'node:path';
import url from 'node:url';

export class FetchWorker {
  #name;
  #data;
  #runFilePath = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '../main.js');

  #instance;

  constructor(name, data, runFilePath) {
    this.#name = name;
    this.#data = data;
    if (runFilePath && `${runFilePath}` !== '') {
      this.#runFilePath = runFilePath;
    }
  }

  start() {
    if (!isMainThread) {
      throw new Error('Worker run script cannot be run outside of main thread.');
    }

    this.#instance = new Worker(this.#runFilePath, { workerData: this.#data, name: this.#name });
    return this.#instance;
  }

  stop() {
    if (!this.#instance) return;
    this.#instance.terminate();
  }
}
