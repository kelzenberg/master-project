import { Simulation } from '../controllers/Simulation.js';

export const createSimControllersFromConfigs = async simConfigs =>
  Promise.all(
    Object.values(simConfigs).map(async simConfig => {
      const instance = new Simulation({ ...simConfig });
      await instance.waitForSimHealth();
      await instance.fetchInitialData();
      return instance;
    })
  );
