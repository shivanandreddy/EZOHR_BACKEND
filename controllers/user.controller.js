import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// POST: Register a new user
export const register = async (req, res) => {
  try {
    const { name, email, password, phone_number, user_type } = req.body;

    if (!name || !email || !password || !user_type) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and user_type are required",
      });
    }

    const allowedUserTypes = ["student", "hr", "admin", "tutor"];

    if (!allowedUserTypes.includes(user_type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user_type",
      });
    }

    // Check existing email
    const existingUser = await pool.query(
      `SELECT user_id FROM users WHERE email = $1`,
      [email],
    );

    if (!existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO Users
        (name, email, password, phone_number, user_type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING
        user_id,
        name,
        email,
        phone_number,
        user_type,
        created_at,
        updated_at,
        is_active,
        is_mail_verified,
        is_mobile_verified`,
      [name, email, hashedPassword, phone_number || null, user_type],
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
    // Check if user exists
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Generate JWT token
    const token = jwt.sign(
      { user_id: user.rows[0].user_id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
