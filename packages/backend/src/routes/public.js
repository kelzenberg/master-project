import express from 'express';
import { handler as livenessHandler } from '../handlers/health/liveness.js';
import { handler as readinessHandler } from '../handlers/health/readiness.js';

export const routes = express.Router().get('/liveness', livenessHandler).get('/readiness', readinessHandler);
