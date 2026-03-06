import LiveSportsTVPanel from './LiveSportsTVPanel';
import SportsNewsPanel from './SportsNewsPanel';

export default function GlobalDashboard() {
  return (
    <div className="p-4 space-y-4 h-full flex flex-col">
      <div className="flex-none">
        <h2 className="text-xl font-bold text-white mb-1">
          🌐 Global Sports Overview
        </h2>
        <p className="text-sm text-gray-400">
          Top headlines and live action around the world
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pb-6 pr-1 custom-scrollbar">
        {/* Live TV Section */}
        <section>
          <LiveSportsTVPanel />
        </section>

        {/* Global News Section */}
        <section>
          <SportsNewsPanel />
        </section>

        {/* Instructions */}
        <div className="mt-8 p-4 bg-gray-800/50 border border-gray-700 rounded-lg text-center">
          <div className="text-2xl mb-2">🌍</div>
          <p className="text-gray-300 font-medium">Interactive Map Mode</p>
          <p className="text-sm text-gray-500 mt-1">
            Click on any highlighted country on the map to view specific local
            live events and scores.
          </p>
        </div>
      </div>
    </div>
  );
}
