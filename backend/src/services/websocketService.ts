import { Server } from 'socket.io'

export const initializeWebSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`)

    socket.on('subscribe-country', (country) => {
      socket.join(`country:${country}`)
      console.log(`Client subscribed to ${country}`)
    })

    socket.on('unsubscribe-country', (country) => {
      socket.leave(`country:${country}`)
    })

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`)
    })
  })

  return io
}

export const broadcastLiveEvent = (io: Server, event: any) => {
  if (event.country) {
    io.to(`country:${event.country}`).emit('live-events', [event])
  }
  io.emit('live-events', [event])
}

export default { initializeWebSocket, broadcastLiveEvent }
