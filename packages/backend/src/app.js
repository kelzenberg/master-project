import path from 'node:path';
import url from 'node:url';
import express from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import compression from 'compression';
import { authorizer } from './middlewares/authorizer.js';
import { routes as publicRoutes } from './routes/public.js';
import { routes as protectedRoutes } from './routes/protected.js';
import { createErrorHandler } from './middlewares/error-handler.js';
import { redirectHandler } from './middlewares/redirect-handler.js';

export const createApp = logger => {
  const app = express().disable('x-powered-by');

  app.use(compression());
  app.use(helmet());
  app.use(bodyParser.json());

  app.use('/images', express.static(path.join(path.dirname(url.fileURLToPath(import.meta.url)), 'images')));
  const staticPath = process.env.NODE_ENV === 'development' ? `../../frontend/dist` : 'static';
  app.use('/', express.static(path.join(path.dirname(url.fileURLToPath(import.meta.url)), staticPath)));

  app.get('/favicon.ico', (req, res) => res.status(204).end()); // temporarily until favicon is available

  app.use(publicRoutes);
  app.use(authorizer);
  app.use(protectedRoutes);

  app.use(redirectHandler);
  app.use(createErrorHandler(logger));

  return app;
};
