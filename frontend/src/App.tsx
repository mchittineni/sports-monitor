import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import MapComponent from './components/MapComponent'
import SportsPanel from './components/SportsPanel'
import ChatAssistant from './components/ChatAssistant'
import { useWebSocket } from './services/websocket'
import { useSportsStore } from './store/sportsStore'

export default function App() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [showChat, setShowChat] = useState(false)
  const { connect } = useWebSocket()
  const { setLiveEvents } = useSportsStore()

  useEffect(() => {
    // Connect to WebSocket for real-time updates
    const unsubscribe = connect((data) => {
      setLiveEvents(data)
    })

    return () => unsubscribe?.()
  }, [connect, setLiveEvents])

  return (
    <div className="flex h-screen w-screen bg-primary">
      {/* Main Map Area */}
      <div className="flex-1 relative">
        <MapComponent onCountrySelect={setSelectedCountry} />
      </div>

      {/* Right Sidebar */}
      <div className="w-96 bg-secondary border-l border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold text-white">🌍 Sports Monitor</h1>
          <p className="text-xs text-gray-400 mt-1">Interactive Live Sports Dashboard</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {selectedCountry ? (
            <SportsPanel country={selectedCountry} />
          ) : (
            <div className="p-4 text-center text-gray-400">
              <p>👆 Click on a country to see live sports</p>
            </div>
          )}
        </div>

        {/* Chat Toggle */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => setShowChat(!showChat)}
            className="w-full bg-accent hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition"
          >
            {showChat ? 'Hide AI Assistant' : 'Show AI Assistant'}
          </button>
        </div>

        {/* Chat Assistant */}
        {showChat && (
          <ChatAssistant />
        )}
      </div>
    </div>
  )
}
