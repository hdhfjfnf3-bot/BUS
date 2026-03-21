import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const base = import.meta.env.BASE_URL || '/';
    const serverUrl = window.location.origin;
    socket = io(serverUrl, {
      path: `${base}api/socket.io`.replace(/\/\//g, '/'),
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
