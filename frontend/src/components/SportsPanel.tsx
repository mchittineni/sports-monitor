import { useEffect, useState } from 'react';
import { getSportsData } from '../services/api';
import MatchCard from './MatchCard';

interface SportsPanelProps {
  country: string;
}

interface Match {
  id: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  score: string;
  status: 'live' | 'upcoming' | 'finished';
  aiSummary?: string;
}

export default function SportsPanel({ country }: SportsPanelProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSportsData = async () => {
      try {
        setLoading(true);
        const data = await getSportsData(country);
        setMatches(data);
        setError(null);
      } catch (err) {
        setError('Failed to load sports data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSportsData();
  }, [country]);

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-700 h-24 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-900 text-red-100 p-3 rounded">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-lg font-semibold text-white mb-4 sticky top-0 bg-secondary">
        🏟️ {country}
      </h2>

      {(matches || []).length === 0 ? (
        <p className="text-gray-400 text-sm">No ongoing events</p>
      ) : (
        (matches || []).map((match) => (
          <MatchCard key={match.id} match={match} />
        ))
      )}
    </div>
  );
}
