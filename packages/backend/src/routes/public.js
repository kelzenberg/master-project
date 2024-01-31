import express from 'express';
import { handler as livenessHandler } from '../handlers/public/liveness.js';
import { handler as readinessHandler } from '../handlers/public/readiness.js';
import { handler as simListHandler } from '../handlers/protected/sim-list.js';

export const routes = express
  .Router()
  .get('/liveness', livenessHandler)
  .get('/readiness', readinessHandler)
  .get('/list', simListHandler); // ToDo: move to protected endpoints
