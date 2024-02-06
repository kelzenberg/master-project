import path from 'node:path';
import url from 'node:url';
import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import helmet from 'helmet';
import favicon from 'serve-favicon';
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

  const currentFilePath = path.dirname(url.fileURLToPath(import.meta.url));
  app.use(favicon(path.join(currentFilePath, './images/favicon.svg')));
  app.use('/img', express.static(path.join(currentFilePath, 'images')));
  const staticPath = process.env.NODE_ENV === 'development' ? `../../frontend/dist` : 'static';
  app.use('/', express.static(path.join(currentFilePath, staticPath)));

  app.use(publicRoutes);
  app.use(authorizer);
  app.use(protectedRoutes);

  app.use(redirectHandler);
  app.use(createErrorHandler(logger));

  return app;
};
