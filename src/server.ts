import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import routes from "./routes/index";

dotenv.config();

// CRITICAL: Check JWT_SECRET before starting
if (!process.env.JWT_SECRET) {
  console.error("❌ ERROR: JWT_SECRET is missing in .env file");
  console.error("Add: JWT_SECRET=your_secret_key_here");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/rbms_db";
mongoose
  .connect(mongoURI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.log("❌ MongoDB Connection Error:", err.message);
    console.log("URI used:", mongoURI);
  });

// Routes
app.use("/api", routes);

// Basic Route
app.get("/", (req, res) => {
  res.json({
    message: "Role-Based Management System Backend",
    status: "Running 🚀",
    endpoints: {
      login: "POST /api/auth/login",
      invite: "POST /api/auth/invite",
    },
  });
});

// Start Server
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
//   console.log(
//     `📝 JWT Secret loaded: ${process.env.JWT_SECRET ? "✅ Yes" : "❌ No"}`,
//   );
// });
