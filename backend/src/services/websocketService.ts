import { Server } from 'socket.io';

/**
 * Initializes the WebSocket server and sets up connection logic.
 *
 * @param {Server} io - The Socket.io server instance.
 * @returns {Server} The configured Socket.io server.
 */
export const initializeWebSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('subscribe-country', (country) => {
      socket.join(`country:${country}`);
      console.log(`Client subscribed to ${country}`);
    });

    socket.on('unsubscribe-country', (country) => {
      socket.leave(`country:${country}`);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Broadcasts a live match event to all connected clients.
 * If the event has a specific country, it emits specifically to the country room as well.
 *
 * @param {Server} io - The Socket.io server instance.
 * @param {any} event - The live sports event object to broadcast.
 */
export const broadcastLiveEvent = (io: Server, event: any) => {
  if (event.country) {
    io.to(`country:${event.country}`).emit('live-events', [event]);
  }
  io.emit('live-events', [event]);
};

export default { initializeWebSocket, broadcastLiveEvent };
