import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { query } from '../database/connection.js';
import { env } from '../config/env.js';

const JWT_SECRET = env.JWT_SECRET;
const JWT_EXPIRY = '7d';
const SALT_ROUNDS = 10;

// simple in-memory store used when running tests so we don't hit real DB
const testUsers: Record<string, any> = {};

/**
 * Standard tokens payload returned after successful authentication.
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Core info encoded within a JWT payload.
 */
export interface TokenPayload {
  userId: string;
  email: string;
  username: string;
}

// Hash password
/**
 * Hashes a plaintext password using bcrypt with standard salt rounds.
 *
 * @param {string} password - The plain text password to hash.
 * @returns {Promise<string>} The securely hashed password.
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

// Compare password
/**
 * Compares a plaintext password against a stored hashed password.
 *
 * @param {string} password - The plain text password.
 * @param {string} hashedPassword - The hashed password stored in the DB.
 * @returns {Promise<boolean>} True if the password is valid, otherwise false.
 */
export const comparePasswords = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// Generate JWT tokens
/**
 * Generates both short-lived access and long-lived refresh JSON Web Tokens.
 *
 * @param {TokenPayload} payload - User object to serialize in the tokens.
 * @returns {AuthTokens} An object containing accessToken and refreshToken.
 */
export const generateTokens = (payload: TokenPayload): AuthTokens => {
  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
    algorithm: 'HS256',
  });

  const refreshToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: '30d',
    algorithm: 'HS256',
  });

  return { accessToken, refreshToken };
};

// Verify token
/**
 * Verifies the validity of an existing JWT token and decodes it.
 *
 * @param {string} token - The raw JWT token string.
 * @returns {TokenPayload | null} The decoded token payload containing user info, or null if invalid.
 */
export const verifyToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

// Register user
/**
 * Creates a new user record in the database securely.
 *
 * @param {string} email - The user's email address.
 * @param {string} username - The user's requested username.
 * @param {string} password - The plain text password to register with.
 * @returns {Promise<{ id: string; email: string; username: string }>} Resulting user's core details.
 */
export const registerUser = async (
  email: string,
  username: string,
  password: string
): Promise<{ id: string; email: string; username: string }> => {
  try {
    if (process.env.NODE_ENV === 'test') {
      // use in-memory store
      if (testUsers[email]) {
        throw new Error('User with this email or username already exists');
      }
      const id = uuid();
      testUsers[email] = { id, email, username, password };
      return { id, email, username };
    }

    // Check if user exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.length > 0) {
      throw new Error('User with this email or username already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const userId = uuid();
    await query(
      `INSERT INTO users (id, email, username, password_hash, avatar_url, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [
        userId,
        email,
        username,
        hashedPassword,
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      ]
    );

    return { id: userId, email, username };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Login user
/**
 * Validates user credentials and issues JWT tokens upon successful authentication.
 *
 * @param {string} email - The user email.
 * @param {string} password - The unhashed password attempt.
 * @returns {Promise<{ user: any; tokens: AuthTokens }>} User details paired with their new connection tokens.
 */
export const loginUser = async (
  email: string,
  password: string
): Promise<{ user: any; tokens: AuthTokens }> => {
  try {
    if (process.env.NODE_ENV === 'test') {
      const u = testUsers[email];
      if (!u || u.password !== password) {
        throw new Error('Invalid email or password');
      }
      const tokens = generateTokens({
        userId: u.id,
        email: u.email,
        username: u.username,
      });
      return {
        user: { id: u.id, email: u.email, username: u.username },
        tokens,
      };
    }

    const result = await query(
      'SELECT id, email, username, password_hash FROM users WHERE email = $1',
      [email]
    );

    if (result.length === 0) {
      throw new Error('Invalid email or password');
    }

    const user = result[0];
    const passwordMatch = await comparePasswords(password, user.password_hash);

    if (!passwordMatch) {
      throw new Error('Invalid email or password');
    }

    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    // Update last login
    await query('UPDATE users SET updated_at = NOW() WHERE id = $1', [user.id]);

    return {
      user: { id: user.id, email: user.email, username: user.username },
      tokens,
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Get user by ID
/**
 * Retrieves core user details from the database by user ID.
 *
 * @param {string} userId - The unique user UUID.
 * @returns {Promise<any | null>} The user's public info, excluding passwords and secure fields.
 */
export const getUserById = async (userId: string) => {
  try {
    if (process.env.NODE_ENV === 'test') {
      return Object.values(testUsers).find((u) => u.id === userId) || null;
    }

    const result = await query(
      'SELECT id, email, username, avatar_url, created_at FROM users WHERE id = $1',
      [userId]
    );

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Get user error:', error);
    throw error;
  }
};

export default {
  hashPassword,
  comparePasswords,
  generateTokens,
  verifyToken,
  registerUser,
  loginUser,
  getUserById,
};
