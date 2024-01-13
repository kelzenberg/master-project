import { SocketEventTypes } from '@master-project/libs/src/events';

// eslint-disable-next-line no-undef
const socket = io(); // `io` object is being exported by '/socket.io/socket.io.js'

socket.on(SocketEventTypes.INIT, message => {
  console.log(`[TEST]: Socket event on ${SocketEventTypes.INIT} arrived with payload: ${JSON.stringify(message)}`);
});

socket.on(SocketEventTypes.MESSAGE, message => {
  console.log(`[TEST]: Socket event on ${SocketEventTypes.MESSAGE} arrived with payload: ${message}`);
});

export function sendTestEvent(payload) {
  socket.emit(SocketEventTypes.MESSAGE, payload ?? `Random event value: ${Math.random()}`);
}

sendTestEvent('Initial Load');
