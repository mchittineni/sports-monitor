import pg from 'pg';

const { Pool } = pg;

/**
 * Shared PostgreSQL connection pool.
 * Pool size is configurable via DB_POOL_MAX (default 20).
 * SSL is enforced with certificate verification in production.
 * Idle connections are released after 30 s; connection attempts time out after 5 s.
 */
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: parseInt(process.env.DB_POOL_MAX || '20'),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: true }
      : false,
});

/**
 * Validates the database connection by acquiring and immediately releasing a client.
 * Throws if the database is unreachable so callers can handle startup failures.
 */
export const initializeDatabaseConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL');
    client.release();
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw error;
  }
};

/**
 * Executes a parameterised SQL query against the shared pool.
 *
 * @param {string} sql    - The SQL string (use $1, $2 … placeholders).
 * @param {any[]}  values - Optional bound parameters matching the placeholders.
 * @returns {Promise<any[]>} The result rows.
 */
export const query = async (sql: string, values?: any[]) => {
  try {
    const result = await pool.query(sql, values);
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export default {
  pool,
  query,
  initializeDatabaseConnection,
};
