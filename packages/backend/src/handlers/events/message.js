import { SocketEventTypes } from '../../utils/events.js';

export const handler = io => message => {
  io.emit(SocketEventTypes.MESSAGE, message);
};
