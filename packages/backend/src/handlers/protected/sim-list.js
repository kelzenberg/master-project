import { simControllers } from '../../index.js';

export const handler = async (req, res) => {
  const querySimId = req.query.id;

  // Get details from one simulation only
  if (querySimId) {
    const simController = simControllers.find(sim => sim.id === querySimId);

    if (!simController) {
      res.status(401).send(`Simulation with ID ${querySimId} could not be found`);
      return;
    }

    res.status(200).send({
      title: simController.title,
      description: simController.description,
    });
    return;
  }

  // Send all simulation IDs
  const simIds = simControllers.map(simController => ({
    id: simController.id,
    title: simController.title,
    description: simController.description,
    thumbnail: simController.getThumbnail(),
  }));

  res.status(200).send(simIds);
};
