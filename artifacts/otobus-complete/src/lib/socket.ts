import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

function normalizeOrigin(url: string): string {
  return url.replace(/\/+$/, '');
}

export function getSocket(): Socket {
  if (!socket) {
    const base = import.meta.env.BASE_URL || '/';
    // Same host (Replit / local proxy): connect to current origin + base path.
    // Split deploy (e.g. Vercel frontend + Railway API): set VITE_API_ORIGIN to the API base URL (no trailing slash).
    const envApi = import.meta.env.VITE_API_ORIGIN as string | undefined;
    const serverUrl = envApi?.trim()
      ? normalizeOrigin(envApi.trim())
      : window.location.origin;
    const path = envApi?.trim()
      ? '/api/socket.io'
      : `${base}api/socket.io`.replace(/\/\//g, '/');
    socket = io(serverUrl, {
      path,
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
