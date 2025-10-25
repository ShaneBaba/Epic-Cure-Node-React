const express = require("express");
const cors = require("cors");
const grantRoutes = require("./routes/grantRoutes");
const loginRoutes = require("./routes/loginRoutes");

// optional for local .env
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// routes
app.use("/api/grants", grantRoutes);
app.use("/api", loginRoutes);

// handy health check
app.get("/health", (_req, res) => res.status(200).send("ok"));

// ✅ use Azure's injected PORT; fall back locally
const PORT = parseInt(process.env.PORT || "4000", 10);
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));  
