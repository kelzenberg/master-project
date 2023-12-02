import express from 'express';

export const createApp = () => {
  const app = express().disable('x-powered-by');

  // app.use(bodyParser.json());
  // app.use(publicRoutes);
  // app.use(authorizer);
  // app.use(protectedRoutes);

  // app.use(errorHandler(logger));

  return app;
};
