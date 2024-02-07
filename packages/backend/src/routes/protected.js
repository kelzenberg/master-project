import express from 'express';
import { handler as protectedTestHandler } from '../handlers/protected/protected.js';
import { handler as simListHandler } from '../handlers/protected/sim-list.js';
import { handler as simResetHandler } from '../handlers/protected/sim-reset.js';

export const routes = express
  .Router()
  .get('/protected', protectedTestHandler)
  .get('/list', simListHandler)
  .post('/reset', simResetHandler);
