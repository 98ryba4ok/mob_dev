const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'wordle',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('PostgreSQL connection error:', err);
  } else {
    console.log('Connected to PostgreSQL');
  }
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  const client = await pool.connect();
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    await client.query('BEGIN');

    // Check if user exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await client.query(
      `INSERT INTO users (username, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, total_score`,
      [username, email, hashedPassword]
    );

    const user = result.rows[0];

    await client.query('COMMIT');

    // Generate token
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: '30d'
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id.toString(),
        username: user.username,
        email: user.email,
        totalScore: user.total_score
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Register error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  } finally {
    client.release();
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password are required' });
    }

    // Find user
    const result = await pool.query(
      'SELECT id, username, email, password, total_score, games_won FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: '30d'
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id.toString(),
        username: user.username,
        email: user.email,
        totalScore: user.total_score,
        gamesWon: user.games_won
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Game routes
app.post('/api/games', authenticateToken, async (req, res) => {
  try {
    const { attempts, won, score, word } = req.body;
    const userId = req.user.userId;

    // Create game record (триггер автоматически обновит статистику)
    await pool.query(
      `INSERT INTO games (user_id, attempts, won, score, word)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, attempts, won, score, word]
    );

    res.json({ success: true, message: 'Game result saved' });
  } catch (error) {
    console.error('Save game error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.get('/api/games/progress', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user statistics
    const userResult = await pool.query(
      `SELECT id, total_score, games_played, games_won, 
              current_streak, best_streak, average_attempts
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Get distribution
    const distResult = await pool.query(
      'SELECT attempts, count FROM attempt_distribution WHERE user_id = $1',
      [userId]
    );

    const distribution = {};
    distResult.rows.forEach(row => {
      distribution[row.attempts] = parseInt(row.count);
    });

    res.json({
      success: true,
      userId: user.id.toString(),
      totalScore: user.total_score,
      gamesPlayed: user.games_played,
      gamesWon: user.games_won,
      currentStreak: user.current_streak,
      bestStreak: user.best_streak,
      averageAttempts: parseFloat(user.average_attempts) || 0,
      distribution
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Leaderboard route
app.get('/api/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    
    const result = await pool.query(
      `SELECT username, total_score, games_won, games_played
       FROM users
       WHERE games_played > 0
       ORDER BY total_score DESC
       LIMIT $1`,
      [limit]
    );

    const leaderboard = result.rows.map((user, index) => ({
      username: user.username,
      totalScore: user.total_score,
      gamesWon: user.games_won,
      winRate: user.games_played > 0
        ? Math.round((user.games_won / user.games_played) * 100)
        : 0,
      rank: index + 1
    }));

    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ success: true, message: 'Server is running', database: 'connected' });
  } catch (error) {
    res.json({ success: true, message: 'Server is running', database: 'disconnected' });
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await pool.end();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
