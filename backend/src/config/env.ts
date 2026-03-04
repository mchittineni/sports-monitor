import dotenv from 'dotenv'

dotenv.config()

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3001'),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',

  // Database
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT || '5432'),
  DB_NAME: process.env.DB_NAME || 'sports_monitor',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || 'password',

  // AWS
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,

  // DynamoDB
  EVENTS_TABLE: process.env.EVENTS_TABLE || 'SportsEvents',

  // Redis
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',

  // External APIs
  SPORTS_API_KEY: process.env.SPORTS_API_KEY,
  RAPID_API_KEY: process.env.RAPID_API_KEY
}

export default env
