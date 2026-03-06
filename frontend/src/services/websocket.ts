import io, { Socket } from 'socket.io-client';

let socket: Socket | null = null;

/**
 * Initializes and establishes a resilient WebSocket connection to the backend server.
 * Includes automatic reconnection logic.
 *
 * @returns {Promise<boolean>} Resolves to true if connected successfully, false on error.
 */
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

/**
 * Gracefully disconnects the active WebSocket connection.
 *
 * @returns {Promise<boolean>} True if disconnected, false if no connection existed.
 */
export const disconnectWebSocket = async (): Promise<boolean> => {
  if (!socket) return false;
  socket.disconnect();
  socket = null;
  return true;
};

/**
 * Subscribes a callback function to a specific WebSocket topic.
 *
 * @param {string} topic - The event name to listen for (e.g., 'live-events').
 * @param {Function} handler - The callback executed when the event is received.
 */
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

/**
 * Custom React Hook providing a simplified interface for WebSocket interactions
 * including connection lifecycle and event emission.
 *
 * @returns {{ connect: Function, emit: Function }} The connect and emit utility functions.
 */
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
