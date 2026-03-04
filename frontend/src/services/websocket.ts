import io, { Socket } from 'socket.io-client'

let socket: Socket | null = null

export const useWebSocket = () => {
  const connect = (onData: (data: any) => void) => {
    const wsUrl = (import.meta.env as any).VITE_WS_URL || 'http://localhost:3001'
    
    socket = io(wsUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    socket.on('connect', () => {
      console.log('WebSocket connected')
    })

    socket.on('live-events', (data) => {
      onData(data)
    })

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected')
    })

    socket.on('error', (error) => {
      console.error('WebSocket error:', error)
    })

    return () => {
      socket?.disconnect()
    }
  }

  const emit = (event: string, data: any) => {
    socket?.emit(event, data)
  }

  return { connect, emit }
}
