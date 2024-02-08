import auth from 'basic-auth';
import { authorizer } from '../authorizer.js';

export const roleHandler = logger => (socket, next) => {
  logger.info(`Authorizing client ${socket.id} and assigning role...`);
  const authorization = auth(socket.handshake);
  const isAuthorized = authorizer(key => {
    socket.data.client.role = key;
    logger.info(`Client ${socket.id} was authorized and assigned role '${key.toUpperCase()}'`);
  })(authorization.name, authorization.pass);

  if (!isAuthorized) {
    next(new Error('Not authorized!'));
  }

  next();
};
