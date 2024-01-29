import { simControllers } from '../../index.js';

export const handler = async (req, res) => {
  const querySimId = req.query.id;

  if (querySimId) {
    // Get details from one simulation only
    const simController = simControllers.find(sim => sim.id === querySimId);
    res
      .status(200)
      .send({ id: simController.id, description: simController.description, thumbnail: simController.getThumbnail() });
  } else {
    // Send all simulation IDs
    const simIds = simControllers.map(sim => sim.id);
    res.status(200).send(simIds);
  }
};
