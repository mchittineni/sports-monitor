import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { v4 as uuid } from 'uuid'

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' })
const docClient = DynamoDBDocumentClient.from(client)

const seedDynamoDB = async () => {
  console.log('🌱 Seeding DynamoDB with live sports events...')

  try {
    const events = [
      {
        pk: `EVENT#${uuid()}`,
        sk: Date.now(),
        eventId: `evt-001`,
        country: 'India',
        countryCode: 'IN',
        sport: 'Cricket',
        homeTeam: 'India',
        awayTeam: 'Australia',
        score: '145/5 vs 82/3',
        status: 'live',
        venue: 'Eden Gardens, Kolkata',
        league: 'ICC World Cup',
        date: new Date().toISOString(),
        minute: 45,
        lastEvent: 'Boundary by Virat Kohli',
        ttl: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60 // 30 days TTL
      },
      {
        pk: `EVENT#${uuid()}`,
        sk: Date.now() + 1000,
        eventId: `evt-002`,
        country: 'Brazil',
        countryCode: 'BR',
        sport: 'Football',
        homeTeam: 'Brazil',
        awayTeam: 'Argentina',
        score: '0-0',
        status: 'scheduled',
        venue: 'Maracanã Stadium, Rio de Janeiro',
        league: 'Copa América',
        date: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
        ttl: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
      },
      {
        pk: `EVENT#${uuid()}`,
        sk: Date.now() + 2000,
        eventId: `evt-003`,
        country: 'United Kingdom',
        countryCode: 'GB',
        sport: 'Football',
        homeTeam: 'England',
        awayTeam: 'Spain',
        score: '2-1',
        status: 'finished',
        venue: 'Wembley Stadium, London',
        league: 'UEFA Euro',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        ttl: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
      },
      {
        pk: `EVENT#${uuid()}`,
        sk: Date.now() + 3000,
        eventId: `evt-004`,
        country: 'United States',
        countryCode: 'US',
        sport: 'Basketball',
        homeTeam: 'USA',
        awayTeam: 'China',
        score: '0-0',
        status: 'scheduled',
        venue: 'Crypto.com Arena, Los Angeles',
        league: 'Olympic Games',
        date: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
        ttl: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
      },
      {
        pk: `EVENT#${uuid()}`,
        sk: Date.now() + 4000,
        eventId: `evt-005`,
        country: 'Germany',
        countryCode: 'DE',
        sport: 'Football',
        homeTeam: 'Germany',
        awayTeam: 'France',
        score: '0-0',
        status: 'live',
        venue: 'Allianz Arena, Munich',
        league: 'UEFA Euro',
        date: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        minute: 32,
        lastEvent: 'Shot by Manuel Neuer (saved)',
        ttl: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
      },
      {
        pk: `EVENT#${uuid()}`,
        sk: Date.now() + 5000,
        eventId: `evt-006`,
        country: 'Pakistan',
        countryCode: 'PK',
        sport: 'Cricket',
        homeTeam: 'Pakistan',
        awayTeam: 'West Indies',
        score: '178/8 vs 156/9',
        status: 'live',
        venue: 'National Stadium, Karachi',
        league: 'T20 World Cup',
        date: new Date().toISOString(),
        minute: 87,
        lastEvent: 'Wide ball by Haris Rauf',
        ttl: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
      },
      {
        pk: `EVENT#${uuid()}`,
        sk: Date.now() + 6000,
        eventId: `evt-007`,
        country: 'Serbia',
        countryCode: 'RS',
        sport: 'Tennis',
        homeTeam: 'Novak Djokovic',
        awayTeam: 'Carlos Alcaraz',
        score: '6-4, 3-6, 0-1',
        status: 'live',
        venue: 'Wimbledon Championships, London',
        league: 'Grand Slam',
        date: new Date().toISOString(),
        ttl: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
      }
    ]

    for (const event of events) {
      await docClient.send(
        new PutCommand({
          TableName: process.env.EVENTS_TABLE || 'SportsEvents',
          Item: event
        })
      )
    }

    console.log(`✅ Created ${events.length} live events in DynamoDB`)
    return events.length
  } catch (error) {
    console.error('❌ DynamoDB seeding failed:', error)
    throw error
  }
}

export default seedDynamoDB
