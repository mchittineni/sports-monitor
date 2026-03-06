/**
 * Core event definition tailored for the frontend UI.
 */
interface Match {
  id: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  score: string;
  status: 'live' | 'upcoming' | 'finished';
  aiSummary?: string;
}

/**
 * Props expected by the MatchCard.
 */
interface MatchCardProps {
  match: Match;
}

/**
 * Renders an isolated UI card detailing a single sports match.
 * Includes dynamic color coding based on match status and optionally displays AI commentary.
 *
 * @param {MatchCardProps} props - The component attributes wrapping the match data.
 * @returns {JSX.Element} A stylized card representing the match.
 */
export default function MatchCard({ match }: MatchCardProps) {
  const statusColors = {
    live: 'bg-red-500',
    upcoming: 'bg-yellow-500',
    finished: 'bg-gray-500',
  };

  return (
    <div className="sports-card border border-gray-600">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-semibold text-gray-300">
          {match.sport}
        </span>
        <span
          className={`text-xs font-bold px-2 py-1 rounded text-white ${statusColors[match.status]}`}
        >
          {match.status.toUpperCase()}
        </span>
      </div>

      <div className="mb-3">
        <p className="text-sm font-semibold">{match.homeTeam}</p>
        <p className="text-lg font-bold text-accent my-1">{match.score}</p>
        <p className="text-sm font-semibold">{match.awayTeam}</p>
      </div>

      {match.aiSummary && (
        <div className="match-highlight">
          <p className="text-xs text-gray-100">{match.aiSummary}</p>
        </div>
      )}
    </div>
  );
}
