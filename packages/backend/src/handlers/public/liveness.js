/**
 * Liveness probe for k8s
 */
export const handler = async (req, res) => {
  res.status(204).send();
};
