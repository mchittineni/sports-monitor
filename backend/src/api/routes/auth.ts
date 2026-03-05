import express, { Request, Response } from 'express';
import {
  registerUser,
  loginUser,
  getUserById,
} from '../../services/authService.js';
import { authMiddleware, AuthRequest } from '../../middleware/auth.js';

const router = express.Router();

// Register endpoint
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;

    // Validation
    if (!email || !username || !password) {
      return res
        .status(400)
        .json({ error: 'Email, username, and password are required' });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: 'Password must be at least 8 characters' });
    }

    if (username.length < 3) {
      return res
        .status(400)
        .json({ error: 'Username must be at least 3 characters' });
    }

    const user = await registerUser(email, username, password);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { user, tokens } = await loginUser(email, password);

    res.status(200).json({
      message: 'Login successful',
      user,
      tokens,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(401).json({ error: error.message });
  }
});

// Get current user (protected)
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await getUserById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;
