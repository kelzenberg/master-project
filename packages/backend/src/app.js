import path from 'node:path';
import url from 'node:url';
import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import helmet from 'helmet';
import basicAuth from 'express-basic-auth';
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

  app.use(publicRoutes);

  app.use((req, res, next) =>
    basicAuth({
      authorizer: authorizer(key => (res.locals.role = key)),
      challenge: true,
      realm: 'FritzHaberInstituteOfTheMaxPlanckSociety',
    })(req, res, next)
  );

  app.use(protectedRoutes);

  const currentPath = path.dirname(url.fileURLToPath(import.meta.url));
  const staticPath = process.env.NODE_ENV === 'development' ? `../../frontend/dist` : 'static';
  app.use(favicon(path.join(currentPath, './images/favicon.svg')));
  app.use('/img', express.static(path.join(currentPath, 'images')));
  app.use('/', express.static(path.join(currentPath, staticPath)));

  app.use(redirectHandler);
  app.use(createErrorHandler(logger));

  return app;
};
