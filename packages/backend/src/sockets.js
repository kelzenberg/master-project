import { Server as SocketIOServer } from 'socket.io';
import { Logger } from './utils/logger.js';

const logger = Logger({ name: 'socket-server' });

export const startSocketServer = (httpServer, serverOptions) => () => {
  const socketServer = new SocketIOServer(httpServer, serverOptions);

  socketServer.on('connection', socket => {
    logger.info('Connection received.');

    socket.on('disconnect', () => logger.info('Connection terminated.'));
  });

  return socketServer;
};
