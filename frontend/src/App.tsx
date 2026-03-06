import { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import MapComponent from './components/MapComponent';
import SportsPanel from './components/SportsPanel';
import GlobalDashboard from './components/GlobalDashboard';
import ChatAssistant from './components/ChatAssistant';
import { useWebSocket } from './services/websocket';
import { useSportsStore } from './store/sportsStore';
import { getLiveEvents } from './services/api';

export default function App() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const { connect } = useWebSocket();
  const { setLiveEvents, liveEvents } = useSportsStore();

  useEffect(() => {
    // Fetch initial live events from API
    const loadInitialData = async () => {
      try {
        const events = await getLiveEvents();
        // Transform events to add country_code
        const transformedEvents = events.map((e: any) => ({
          ...e,
          country_code: e.country_code || getCountryCode(e.country),
        }));
        setLiveEvents(transformedEvents);
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };

    loadInitialData();

    // Connect to WebSocket for real-time updates
    const unsubscribe = connect((data) => {
      setLiveEvents(data);
    });

    return () => unsubscribe?.();
  }, [connect, setLiveEvents]);

  // Helper function to get country code from country name
  const getCountryCode = (countryName: string): string => {
    const countryCodeMap: { [key: string]: string } = {
      USA: 'US',
      England: 'GB',
      Spain: 'ES',
      India: 'IN',
      Australia: 'AU',
      Russia: 'RU',
      Japan: 'JP',
    };
    return countryCodeMap[countryName] || 'XX';
  };

  return (
    <div className="flex h-screen w-screen bg-primary">
      {/* Main Map Area */}
      <div className="flex-1 relative">
        <MapComponent onCountrySelect={setSelectedCountry} />
      </div>

      {/* Right Sidebar */}
      <div className="w-[450px] bg-secondary border-l border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold text-white">🌍 Sports Monitor</h1>
          <p className="text-xs text-gray-400 mt-1">
            Interactive Live Sports Dashboard
          </p>
          {liveEvents.length > 0 && (
            <p className="text-xs text-green-400 mt-2">
              📡 {liveEvents.length} live events
            </p>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {selectedCountry ? (
            <div className="flex-1 overflow-y-auto">
              <SportsPanel country={selectedCountry} />
            </div>
          ) : (
            <GlobalDashboard />
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
        {showChat && <ChatAssistant />}
      </div>
    </div>
  );
}
