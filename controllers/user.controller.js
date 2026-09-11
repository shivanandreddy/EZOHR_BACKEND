import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// POST: Register a new user
export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone_number,
    } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone_number) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password, and phone number are required",
      });
    }

    // Check existing email
    const existingUser = await pool.query(
      `SELECT id FROM users WHERE email = $1`,
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      `INSERT INTO users
        (name, email, password, phone_number)
       VALUES ($1, $2, $3, $4)
       RETURNING
        id,
        name,
        email,
        phone_number,
        user_type,
        created_at,
        updated_at,
        is_active,
        is_mail_verified,
        is_mobile_verified`,
      [
        name,
        email,
        hashedPassword,
        phone_number || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: result.rows[0],
    });

  } catch (error) {
    console.error("Create User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// GET: Fetch all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await pool.query("SELECT * FROM users");
    res.status(200).json(users.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST: User login using jwt,bcryot
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Fetch user from PostgreSQL
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const user = result.rows[0];

    // 2. Validate password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // 3. Define JWT Payload (Synced with middleware)
    const payload = {
      id: user.user_id,
      email: user.email,
      role: user.user_type
    };

    // 4. Sign JWT Token
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    // 5. Structure JSON response
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.user_type
    };

    res.status(200).json({ token, user: userData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};