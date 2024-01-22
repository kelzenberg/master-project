export const createErrorHandler = logger => (error, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  const { status, statusCode } = error;
  res.status(status || statusCode || 500);

  logger.error('An error occurred:', error);
  res.json({});
};
