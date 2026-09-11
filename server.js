import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/db.js";
import userRoutes from "./routes/user.routes.js";
import companyRoutes from "./routes/company.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

//cors
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, mobile apps)
      // Allow localhost and any Vercel domain (*.vercel.app)
      if (
        !origin ||
        origin.startsWith('http://localhost') ||
        origin.endsWith('.vercel.app')
      ) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS'));
      }
    },
    credentials: true,
  })
);

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint


// GET: Fetch all users
app.get("/api", async (req, res) => {
  res.status(200).send("Welcome to the Ezohr BackendAPI!" );
});

app.use("/api/users", userRoutes);
app.use("/api/companies", companyRoutes);

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
