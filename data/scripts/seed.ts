import seedPostgres from './seedPostgres.js'
import seedDynamoDB from './seedDynamoDB.js'

const runSeeds = async () => {
  console.log('🌱 Starting database seeding...')
  console.log('=' * 50)

  try {
    // Seed PostgreSQL
    await seedPostgres()

    // Seed DynamoDB
    await seedDynamoDB()

    console.log('=' * 50)
    console.log('✅ All seeds completed successfully!')
  } catch (error) {
    console.error('❌ Seeding encountered an error:', error)
    process.exit(1)
  }
}

runSeeds()
