import { validate as uuidValidate } from 'uuid';
import { simControllers } from '../../index.js';
import { Logger } from '../../utils/logger.js';

const logger = Logger({ name: 'post-sim-reset' });

export const handler = async (req, res) => {
  const querySimId = `${req.query.id}`.trim();

  if (!querySimId || !uuidValidate(querySimId)) {
    const message = `ID ${querySimId} has an incorrect format or length`;
    logger.error(message);
    res.status(400).send(message);
    return;
  }

  logger.info(`Resetting simulation with simId ${querySimId}...`);

  const simController = simControllers.find(sim => sim.uuid === querySimId);

  if (!simController) {
    const message = `Simulation with ID ${querySimId} could not be found`;
    logger.error(message);
    res.status(404).send(message);
    return;
  }

  await simController.resetSim();

  res.status(200).send();
  return;
};
