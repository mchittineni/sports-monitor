import { useState, useEffect } from 'react';

// Mock news data since we don't have a live sports news API connected yet
// In a real scenario, this would be fetched from ESPN/SkySports RSS or API
const MOCK_NEWS = [
  {
    id: 1,
    title: 'Champions League Draw: Quarter-Final matchups revealed',
    source: 'Global Sports',
    time: '2 hours ago',
    category: 'Soccer',
    url: '#',
  },
  {
    id: 2,
    title: 'LeBron James sets new scoring record in Lakers victory',
    source: 'Hoops Insider',
    time: '4 hours ago',
    category: 'Basketball',
    url: '#',
  },
  {
    id: 3,
    title: 'World Athletics Championships: New world record in 100m sprint',
    source: 'Athletics Daily',
    time: '6 hours ago',
    category: 'Track & Field',
    url: '#',
  },
  {
    id: 4,
    title:
      'Formula 1: Verstappen secures pole position for upcoming Grand Prix',
    source: 'Motorsport Now',
    time: '8 hours ago',
    category: 'Racing',
    url: '#',
  },
  {
    id: 5,
    title:
      'Tennis Grand Slam: Unseeded player reaches semi-finals in stunning upset',
    source: 'Court Side',
    time: '12 hours ago',
    category: 'Tennis',
    url: '#',
  },
];

export default function SportsNewsPanel() {
  const [news] = useState(MOCK_NEWS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API load
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 shadow-md flex flex-col h-[400px]">
      {/* Header */}
      <div className="flex justify-between items-center p-3 border-b border-gray-700 bg-gray-900 sticky top-0">
        <h3 className="font-bold text-white flex items-center gap-2">
          📰 Sports News
        </h3>
        <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-1 rounded">
          Top Stories
        </span>
      </div>

      {/* News List */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="space-y-3 p-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="animate-pulse flex flex-col gap-2 p-3 bg-gray-750 rounded border border-gray-700/50"
              >
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                <div className="flex justify-between mt-1">
                  <div className="h-2 bg-gray-700 rounded w-1/4"></div>
                  <div className="h-2 bg-gray-700 rounded w-1/5"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {news.map((item) => (
              <a
                href={item.url}
                key={item.id}
                className="block p-3 bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 transition-colors group cursor-pointer"
              >
                <h4 className="text-sm font-medium text-gray-200 group-hover:text-blue-400 mb-2 leading-snug">
                  {item.title}
                </h4>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span className="flex items-center gap-1.5 ">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    {item.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span>{item.source}</span>
                    <span className="text-gray-600">•</span>
                    <span>{item.time}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-gray-700 bg-gray-900 text-center">
        <button className="text-xs text-blue-400 hover:text-blue-300 w-full py-1">
          View All Headlines
        </button>
      </div>
    </div>
  );
}
