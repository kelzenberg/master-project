/**
 * Enum of different types of WebSocket events (aka event names).
 */
export const SocketEventTypes = Object.freeze({
  INITIAL: 'initial',
  DYNAMIC: 'dynamic',
  SLIDER: 'slider',
}); // converts event types object to an Enum by freezing the object
