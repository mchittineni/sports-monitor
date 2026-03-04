-- Sports Events Table (for DynamoDB, this is a reference schema)
-- Primary Key: pk = EVENT#{uuid}, sk = TIMESTAMP#{timestamp}
-- GSI: CountryCodeIndex (countryCode, timestamp)
-- GSI: SportIndex (sport, timestamp)

-- PostgreSQL Tables
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sports_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    country_code VARCHAR(2) NOT NULL,
    sport VARCHAR(100) NOT NULL,
    logo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id VARCHAR(255) UNIQUE,
    sport VARCHAR(100) NOT NULL,
    home_team_id UUID REFERENCES sports_teams(id),
    away_team_id UUID REFERENCES sports_teams(id),
    home_team_name VARCHAR(255),
    away_team_name VARCHAR(255),
    start_time TIMESTAMP,
    status VARCHAR(50), -- 'scheduled', 'live', 'finished'
    home_score INTEGER,
    away_score INTEGER,
    country_code VARCHAR(2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE match_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    event_type VARCHAR(50), -- 'goal', 'wicket', 'yellow_card', etc.
    minute INTEGER,
    player_name VARCHAR(255),
    team_id UUID REFERENCES sports_teams(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_watched_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, match_id)
);

CREATE TABLE user_favorite_sports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    sport VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, sport)
);

CREATE TABLE match_ai_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    prediction TEXT,
    confidence_score DECIMAL(3,2),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_country ON matches(country_code);
CREATE INDEX idx_matches_sport ON matches(sport);
CREATE INDEX idx_matches_start_time ON matches(start_time DESC);
CREATE INDEX idx_match_events_match_id ON match_events(match_id);
CREATE INDEX idx_user_watched_matches_user_id ON user_watched_matches(user_id);
CREATE INDEX idx_user_favorite_sports_user_id ON user_favorite_sports(user_id);
CREATE INDEX idx_match_ai_summaries_match_id ON match_ai_summaries(match_id);

-- DynamoDB Table Schema (for reference)
/*
Table: SportsEvents (On-demand billing)
PrimaryKey:
  - pk: STRING (EVENT#{uuid})
  - sk: NUMBER (TIMESTAMP#{unix_timestamp})

GlobalSecondaryIndexes:
  CountryCodeIndex:
    - pk: STRING (countryCode)
    - sk: NUMBER (timestamp)
  
  SportIndex:
    - pk: STRING (sport)
    - sk: NUMBER (timestamp)

Attributes:
  - eventId: STRING
  - country: STRING
  - countryCode: STRING
  - sport: STRING
  - homeTeam: STRING
  - awayTeam: STRING
  - score: STRING
  - status: STRING (live|upcoming|finished)
  - date: NUMBER
  - league: STRING
  - location: STRING
  - ttl: NUMBER (for automatic cleanup after 30 days)
*/
