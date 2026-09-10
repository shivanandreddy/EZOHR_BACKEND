import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// POST: Register a new user
export const register= async (req, res) => {
  const { email, password, phone_number, user_type } = req.body;

  try {
    // Check if user already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert user
    const newUser = await pool.query(
      `INSERT INTO users (email, password_hash, phone_number, user_type)
       VALUES ($1, $2, $3, $4)
       RETURNING user_id, email, phone_number, user_type, created_at, is_active, is_mail_verified, is_mobile_verified`,
      [email, password_hash, phone_number, user_type]
    );

    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET: Fetch all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await pool.query('SELECT * FROM users');
    res.status(200).json(users.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST: User login using jwt,bcryot
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = jwt.sign({ user_id: user.rows[0].user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
