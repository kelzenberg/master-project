/**
 * Enum of different types of WebSocket events (aka event names).
 */
export const SocketEventTypes = Object.freeze({
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  SIM_ID: 'sim-id',
  USER_ROLE: 'user-role',
  INITIAL: 'initial',
  DYNAMIC: 'dynamic',
  SLIDER: 'slider',
}); // converts event types object to an Enum by freezing the object
