/**
 * Enum of different types of WebSocket events (aka event names).
 */
export const SocketEventTypes = Object.freeze({
  INIT: 'init',
  MESSAGE: 'message',
}); // converts event types object to an Enum by freezing the object
