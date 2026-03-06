import { query } from '../database/connection.js';
import { v4 as uuid } from 'uuid';

const seedDatabase = async () => {
  console.log('🌱 Seeding PostgreSQL database...');

  try {
    // Seed Users
    console.log('📝 Creating sample users...');
    const users = [
      {
        id: uuid(),
        email: 'demo@sports-monitor.com',
        username: 'demo_user',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
      },
      {
        id: uuid(),
        email: 'analyst@sports-monitor.com',
        username: 'sports_analyst',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=analyst',
      },
      {
        id: uuid(),
        email: 'fan@sports-monitor.com',
        username: 'sports_fan',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fan',
      },
    ];

    for (const user of users) {
      await query(
        'INSERT INTO users (id, email, username, avatar_url) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
        [user.id, user.email, user.username, user.avatar_url]
      );
    }
    console.log(`✅ Created ${users.length} users`);

    // Seed Sports Teams
    console.log('🏟️  Creating sample teams...');
    const teams = [
      // Football Teams
      {
        name: 'France',
        country_code: 'FR',
        sport: 'Football',
        logo_url: 'https://flagcdn.com/fr.svg',
      },
      {
        name: 'Germany',
        country_code: 'DE',
        sport: 'Football',
        logo_url: 'https://flagcdn.com/de.svg',
      },
      {
        name: 'Brazil',
        country_code: 'BR',
        sport: 'Football',
        logo_url: 'https://flagcdn.com/br.svg',
      },
      {
        name: 'Argentina',
        country_code: 'AR',
        sport: 'Football',
        logo_url: 'https://flagcdn.com/ar.svg',
      },
      {
        name: 'England',
        country_code: 'GB',
        sport: 'Football',
        logo_url: 'https://flagcdn.com/gb.svg',
      },
      {
        name: 'Spain',
        country_code: 'ES',
        sport: 'Football',
        logo_url: 'https://flagcdn.com/es.svg',
      },

      // Cricket Teams
      {
        name: 'India',
        country_code: 'IN',
        sport: 'Cricket',
        logo_url: 'https://flagcdn.com/in.svg',
      },
      {
        name: 'Australia',
        country_code: 'AU',
        sport: 'Cricket',
        logo_url: 'https://flagcdn.com/au.svg',
      },
      {
        name: 'Pakistan',
        country_code: 'PK',
        sport: 'Cricket',
        logo_url: 'https://flagcdn.com/pk.svg',
      },
      {
        name: 'West Indies',
        country_code: 'WI',
        sport: 'Cricket',
        logo_url: 'https://flagcdn.com/bb.svg',
      },

      // Basketball
      {
        name: 'USA',
        country_code: 'US',
        sport: 'Basketball',
        logo_url: 'https://flagcdn.com/us.svg',
      },
      {
        name: 'China',
        country_code: 'CN',
        sport: 'Basketball',
        logo_url: 'https://flagcdn.com/cn.svg',
      },

      // Tennis
      {
        name: 'Serbia',
        country_code: 'RS',
        sport: 'Tennis',
        logo_url: 'https://flagcdn.com/rs.svg',
      },
      {
        name: 'Russia',
        country_code: 'RU',
        sport: 'Tennis',
        logo_url: 'https://flagcdn.com/ru.svg',
      },
    ];

    for (const team of teams) {
      await query(
        'INSERT INTO sports_teams (name, country_code, sport, logo_url) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
        [team.name, team.country_code, team.sport, team.logo_url]
      );
    }
    console.log(`✅ Created ${teams.length} teams`);

    // Seed Matches
    console.log('⚽ Creating sample matches...');
    const matches = [
      {
        external_id: 'match-001',
        sport: 'Football',
        home_team_name: 'France',
        away_team_name: 'Germany',
        start_time: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        status: 'scheduled',
        home_score: null,
        away_score: null,
        country_code: 'FR',
      },
      {
        external_id: 'match-002',
        sport: 'Football',
        home_team_name: 'Brazil',
        away_team_name: 'Argentina',
        start_time: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
        status: 'scheduled',
        home_score: null,
        away_score: null,
        country_code: 'BR',
      },
      {
        external_id: 'match-003',
        sport: 'Cricket',
        home_team_name: 'India',
        away_team_name: 'Australia',
        start_time: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago (live)
        status: 'live',
        home_score: 145,
        away_score: 82,
        country_code: 'IN',
      },
      {
        external_id: 'match-004',
        sport: 'Football',
        home_team_name: 'England',
        away_team_name: 'Spain',
        start_time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago (finished)
        status: 'finished',
        home_score: 2,
        away_score: 1,
        country_code: 'GB',
      },
      {
        external_id: 'match-005',
        sport: 'Basketball',
        home_team_name: 'USA',
        away_team_name: 'China',
        start_time: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours from now
        status: 'scheduled',
        home_score: null,
        away_score: null,
        country_code: 'US',
      },
    ];

    let matchIds = [];
    for (const match of matches) {
      const result = await query(
        `INSERT INTO matches (external_id, sport, home_team_name, away_team_name, start_time, status, home_score, away_score, country_code)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (external_id) DO NOTHING
         RETURNING id`,
        [
          match.external_id,
          match.sport,
          match.home_team_name,
          match.away_team_name,
          match.start_time,
          match.status,
          match.home_score,
          match.away_score,
          match.country_code,
        ]
      );
      if (result.length > 0) {
        matchIds.push(result[0].id);
      }
    }
    console.log(`✅ Created ${matchIds.length} matches`);

    // Seed Match Events
    if (matchIds.length > 0) {
      console.log('📋 Creating sample match events...');
      const events = [
        {
          match_id: matchIds[2], // India vs Australia (live)
          event_type: 'wicket',
          minute: 25,
          player_name: 'Rohit Sharma',
          team_name: 'India',
          description: 'Bowled by Jason Starc',
        },
        {
          match_id: matchIds[2],
          event_type: 'boundary',
          minute: 30,
          player_name: 'Virat Kohli',
          team_name: 'India',
          description: 'Hit a beautiful six over mid-wicket',
        },
        {
          match_id: matchIds[3], // England vs Spain (finished)
          event_type: 'goal',
          minute: 15,
          player_name: 'Harry Kane',
          team_name: 'England',
          description: 'Header from a corner kick',
        },
        {
          match_id: matchIds[3],
          event_type: 'goal',
          minute: 42,
          player_name: 'Sergio Busquets',
          team_name: 'Spain',
          description: 'Penalty kick',
        },
        {
          match_id: matchIds[3],
          event_type: 'goal',
          minute: 78,
          player_name: 'Bukayo Saka',
          team_name: 'England',
          description: 'Counter-attack finish',
        },
      ];

      for (const event of events) {
        await query(
          `INSERT INTO match_events (match_id, event_type, minute, player_name, description)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            event.match_id,
            event.event_type,
            event.minute,
            event.player_name,
            event.description,
          ]
        );
      }
      console.log(`✅ Created ${events.length} match events`);

      // Seed AI Summaries
      console.log('🤖 Creating sample AI summaries...');
      const summaries = [
        {
          match_id: matchIds[2],
          summary:
            'India vs Australia is heating up! Rohit Sharma was dismissed early, but Virat Kohli is playing brilliantly. India currently at 145/5. Australia needs to capitalize on their bowling advantage.',
          prediction:
            'India has a 65% chance of winning based on current form and pitch conditions.',
          confidence_score: 0.72,
        },
        {
          match_id: matchIds[3],
          summary:
            'England and Spain delivered an entertaining match! England took the lead through Harry Kane early. Spain equalized with a penalty from Busquets, but Saka sealed the victory with a late counter-attack goal.',
          prediction:
            'England dominated the match with 62% possession and 14 shots on target.',
          confidence_score: 0.95,
        },
      ];

      for (const summary of summaries) {
        await query(
          `INSERT INTO match_ai_summaries (match_id, summary, prediction, confidence_score)
           VALUES ($1, $2, $3, $4)`,
          [
            summary.match_id,
            summary.summary,
            summary.prediction,
            summary.confidence_score,
          ]
        );
      }
      console.log(`✅ Created ${summaries.length} AI summaries`);
    }

    // Seed Favorite Sports
    console.log('❤️  Creating favorite sports...');
    const demoUser = users[0];
    const sports = ['Football', 'Cricket', 'Basketball'];

    for (const sport of sports) {
      await query(
        'INSERT INTO user_favorite_sports (user_id, sport) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [demoUser.id, sport]
      );
    }
    console.log(`✅ Added ${sports.length} favorite sports for demo user`);

    console.log('✅ PostgreSQL seeding completed!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
};

export default seedDatabase;
