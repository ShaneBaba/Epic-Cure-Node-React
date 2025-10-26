const express = require("express");
const cors = require("cors");
const grantRoutes = require("./routes/grantRoutes");
const loginRoutes = require("./routes/loginRoutes");

// Load .env only in local/dev
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// DB helper (uses process.env.DATABASE_URL)
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// routes
app.use("/api/grants", grantRoutes);
app.use("/api", loginRoutes);

// health checks
app.get("/health", (_req, res) => res.send("ok"));
app.get("/db-health", async (_req, res) => {
  try {
    const { rows } = await db.query("SELECT 1 AS ok");
    res.json({ db: "up", result: rows[0] });
  } catch (e) {
    console.error("DB health error:", e.message);
    res.status(500).json({ db: "down", error: e.message });
  }
});

// ✅ use Azure's injected PORT; fall back locally
const PORT = parseInt(process.env.PORT || "4000", 10);
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
