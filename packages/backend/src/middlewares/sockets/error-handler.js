export const errorHandler = logger => (socket, next) => {
  socket.on('error', error => {
    logger.error(`Socket error on event type: ${`${socket.event}`.toUpperCase()}`, { error, data: { id: socket.id } });
  });
  next();
};
