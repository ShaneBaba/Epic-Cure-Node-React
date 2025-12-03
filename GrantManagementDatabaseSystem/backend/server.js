const express = require("express");
const cors = require("cors");
const grantRoutes = require("./routes/grantRoutes");
const loginRoutes = require("./routes/loginRoutes");
const documentRoutes = require("./routes/documentRoutes");
const db = require("./db");

// Load .env only in local/dev
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const app = express();
app.use(cors());
app.use(express.json());

// routes
app.use("/api/documents", documentRoutes);
app.use("/api/grants", grantRoutes);
app.use("/api", loginRoutes);

app.get("/api/db-test", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");
    return res.json({ ok: true, time: result.rows[0].now });
  } catch (err) {
    console.error("DB test error:", err);
    return res.json({ ok: false, error: err.message });
  }
});

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

const PORT = parseInt(process.env.PORT || "4000", 10);
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
