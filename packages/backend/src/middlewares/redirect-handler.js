export const redirectHandler = (error, req, res, next) => {
  if (req.method !== 'GET' || error.status !== 401 || error.statusCode !== 401) {
    next(error);
    return;
  }

  res.redirect(301, '/');
};
