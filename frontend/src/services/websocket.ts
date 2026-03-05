import io, { Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const connectWebSocket = async (): Promise<boolean> => {
  const wsUrl = (import.meta as any).env.VITE_WS_URL || 'http://localhost:3001';

  socket = io(wsUrl, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  return new Promise((resolve) => {
    socket?.on('connect', () => {
      console.log('WebSocket connected');
      resolve(true);
    });

    socket?.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      resolve(false);
    });
  });
};

export const disconnectWebSocket = async (): Promise<boolean> => {
  if (!socket) return false;
  socket.disconnect();
  socket = null;
  return true;
};

export const subscribeToUpdates = (
  topic: string,
  handler: (data: any) => void
): void => {
  if (!socket) {
    console.warn('WebSocket not connected, cannot subscribe');
    return;
  }

  socket.on(topic, handler);
};

export const useWebSocket = () => {
  const connect = (onData: (data: any) => void) => {
    connectWebSocket().then(() => {
      socket?.on('live-events', (data) => {
        onData(data);
      });
    });

    return () => {
      disconnectWebSocket();
    };
  };

  const emit = (event: string, data: any) => {
    socket?.emit(event, data);
  };

  return { connect, emit };
};
