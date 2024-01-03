import { eventTypes } from '../../utils/events.js';

export const handler = io => message => {
  io.emit(eventTypes.MESSAGE, message);
};
