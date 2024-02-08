export const clientDataHandler = logger => (socket, next) => {
  logger.info(`Setting up client data for ${socket.id}`);
  socket.data.client = { role: null, currentSimUUID: null, currentRoomId: null };
  next();
};
