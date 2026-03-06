import { useState } from 'react';

// Common sports channels available on YouTube
const SPORTS_CHANNELS = [
  {
    id: 'skysportsnews',
    name: 'Sky Sports News',
    handle: '@SkySportsNews',
    fallbackVideoId: '9Auq9mYxFEE',
  },
  {
    id: 'cbssportshq',
    name: 'CBS Sports HQ',
    handle: '@CBSSports',
    fallbackVideoId: 'K1xwWEq2MHg',
  }, // Typically live streams
  {
    id: 'nbcsports',
    name: 'NBC Sports',
    handle: '@nbcsports',
    fallbackVideoId: 'S-7G88Iqg2c',
  },
  { id: 'espn', name: 'ESPN', handle: '@espn', fallbackVideoId: 'uJjYp1A_Nl4' },
];

export default function LiveSportsTVPanel() {
  const [activeChannel, setActiveChannel] = useState(SPORTS_CHANNELS[0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  // Using simple iframe embed for React instead of the complex YT JS API
  // to prioritize stability across different sports-monitor environments
  const getEmbedUrl = (videoId: string) => {
    const params = new URLSearchParams({
      autoplay: isPlaying ? '1' : '0',
      mute: isMuted ? '1' : '0',
      controls: '1',
      rel: '0',
      modestbranding: '1',
      playsinline: '1',
    });
    return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 shadow-md flex flex-col mb-4">
      {/* Header */}
      <div className="flex justify-between items-center p-3 border-b border-gray-700 bg-gray-900">
        <h3 className="font-bold text-white flex items-center gap-2">
          📺 Live Sports TV
        </h3>
        <div className="flex items-center gap-2">
          {/* Live Indicator */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors ${
              isPlaying
                ? 'bg-red-900/50 text-red-400 hover:bg-red-900/70'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}
            ></span>
            {isPlaying ? 'Live' : 'Paused'}
          </button>

          {/* Mute Toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-1.5 rounded transition-colors ${
              isMuted
                ? 'bg-gray-700 text-gray-400 hover:text-white'
                : 'bg-blue-900/50 text-blue-400 hover:text-blue-300'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            ) : (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Video Player Area */}
      <div className="relative w-full aspect-video bg-black">
        {isPlaying ? (
          <iframe
            className="w-full h-full border-0"
            src={getEmbedUrl(activeChannel.fallbackVideoId)}
            title={`${activeChannel.name} Live Stream`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 bg-gray-900">
            <p>Playback paused</p>
          </div>
        )}
      </div>

      {/* Channel Switcher */}
      <div className="p-2 bg-gray-900 border-t border-gray-700 flex flex-wrap gap-2">
        {SPORTS_CHANNELS.map((channel) => (
          <button
            key={channel.id}
            onClick={() => setActiveChannel(channel)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              activeChannel.id === channel.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {channel.name}
          </button>
        ))}
      </div>
    </div>
  );
}
