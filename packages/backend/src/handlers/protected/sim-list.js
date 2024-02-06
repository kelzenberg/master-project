import { validate as uuidValidate } from 'uuid';
import { simControllers } from '../../index.js';
import { Logger } from '../../utils/logger.js';

const logger = Logger({ name: 'get-sim-list' });

export const handler = async (req, res) => {
  if (!req.query.id || req.query.id.length === 0) {
    logger.info(`Retrieving all available simulation IDs...`);

    const simIds = simControllers.map(simController => ({
      id: simController.uuid, // mapping `uuid` to `id` for response to frontend is correct here
      title: simController.title,
      description: simController.description,
      thumbnail: simController.getThumbnailPath(), // mapping `thumbnailPath` to `thumbnail` for response to frontend is correct here
    }));

    res.status(200).send(simIds);
    return;
  }

  const querySimId = `${req.query.id}`.trim();
  logger.info(`Retrieving details for simulation with simId ${querySimId}...`);

  if (!uuidValidate(querySimId)) {
    const message = `ID ${querySimId} has an incorrect format or length`;
    logger.error(message);
    res.status(400).send(message);
    return;
  }

  const simController = simControllers.find(sim => sim.uuid === querySimId);

  if (!simController) {
    const message = `Simulation with ID ${querySimId} could not be found`;
    logger.error(message);
    res.status(404).send(message);
    return;
  }

  res.status(200).send({
    title: simController.title,
    description: simController.description,
  });
  return;
};
