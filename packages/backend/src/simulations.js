import { Simulation } from './models/Simulation.js';

const createSimInstances = async simConfigs =>
  Promise.all(
    Object.values(simConfigs).map(async simConfig => {
      const instance = new Simulation({ ...simConfig });
      await instance.waitForSimHealth();
      await instance.fetchInitialData();
      return instance;
    })
  );

export const getSimulationInstances = async simConfigs => createSimInstances(simConfigs);
