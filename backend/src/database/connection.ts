import pg from 'pg'

const { Pool } = pg

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20
})

export const initializeDatabaseConnection = async () => {
  try {
    const client = await pool.connect()
    console.log('Connected to PostgreSQL')
    client.release()
  } catch (error) {
    console.error('Failed to connect to database:', error)
    throw error
  }
}

export const query = async (sql: string, values?: any[]) => {
  try {
    const result = await pool.query(sql, values)
    return result.rows
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

export default {
  pool,
  query,
  initializeDatabaseConnection
}
