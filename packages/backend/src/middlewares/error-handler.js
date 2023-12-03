export const createErrorHandler = logger => (error, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  logger.error('An error occurred:', error);
  res.status(error.status || 500).json({});
};
