import express from 'express';
import bodyParser from 'body-parser';
import { authorizer } from './middlewares/authorizer.js';
import { routes as publicRoutes } from './routes/public.js';
import { routes as protectedRoutes } from './routes/protected.js';
import { createErrorHandler } from './middlewares/error-handler.js';

export const createApp = logger => {
  const app = express().disable('x-powered-by');

  app.use(bodyParser.json());
  app.use(publicRoutes);
  app.use(authorizer);
  app.use(protectedRoutes);

  app.use(createErrorHandler(logger));

  return app;
};
