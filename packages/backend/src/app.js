import express from 'express';
import bodyParser from 'body-parser';
import { authorizer } from './middlewares/authorizer.js';
import { routes as publicRoutes } from './routes/public.js';

export const createApp = () => {
  const app = express().disable('x-powered-by');

  app.use(bodyParser.json());
  app.use(publicRoutes);
  app.use(authorizer);
  // app.use(protectedRoutes);

  // app.use(errorHandler(logger));

  return app;
};
