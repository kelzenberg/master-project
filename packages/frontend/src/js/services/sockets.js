import { SocketEventTypes } from '@master-project/libs/src/events';

// eslint-disable-next-line no-undef
const socket = io(); // `io` object is being exported by '/socket.io/socket.io.js'

socket.on(SocketEventTypes.INITIAL, payload => {
  console.log(`[TEST]: Socket event on ${SocketEventTypes.INITIAL} arrived with payload: ${payload}`);
});

socket.on(SocketEventTypes.DYNAMIC, payload => {
  console.log(`[TEST]: Socket event on ${SocketEventTypes.DYNAMIC} arrived with payload: ${payload}`);
});

export function sendTestEvent(payload) {
  socket.emit(SocketEventTypes.DYNAMIC, payload ?? `Random event value: ${Math.random()}`);
}

sendTestEvent('Initial Load');
