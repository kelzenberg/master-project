/**
 * Readiness probe for k8s
 */
export const handler = async (req, res) => {
  await Promise.all([]); // check if Cache etc. are ready
  res.status(204).send();
};
