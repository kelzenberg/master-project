import { db } from '../../services/sqlite.js';

/**
 * Readiness probe for k8s
 */
export const handler = async (req, res) => {
  await Promise.all([await db.checkReadiness()]); // check if database is ready to accept connections
  res.status(204).send();
};
