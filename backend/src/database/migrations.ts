export const createTables = async (query: Function) => {
  try {
    // Users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Favorite sports table
    await query(`
      CREATE TABLE IF NOT EXISTS favorite_sports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        sport_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, sport_name)
      )
    `)

    // Watched matches table
    await query(`
      CREATE TABLE IF NOT EXISTS watched_matches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        match_id VARCHAR(255) NOT NULL,
        watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    console.log('✅ Database tables created')
  } catch (error) {
    console.error('Error creating tables:', error)
    throw error
  }
}

export default { createTables }
