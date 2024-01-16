export const packetLogger = logger => (socket, next) => {
  logger.info(`New socket event on event type: ${`${socket.event}`.toUpperCase()}`, {
    data: { id: socket.id, socket },
  });
  next();
};
