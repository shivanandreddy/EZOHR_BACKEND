import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/user.routes.js";
import pool from "./config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// GET: Fetch all users
app.get("/", async (req, res) => {
  res.status(200).json({ message: "Welcome to the Ezohr BackendAPI!" });
});

app.use("/api/users", userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Test Database Connection
  pool.connect()
  .then((client) => {
    console.log('Connected to Render PostgreSQL successfully!');
    client.release();
  })
  .catch((err) => {
    console.error('PostgreSQL connection error:', err.message);
  });
});
