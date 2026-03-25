const express = require("express");
const cors = require("cors");
const path = require("path");
const grantRoutes = require("./routes/grantRoutes");
const loginRoutes = require("./routes/loginRoutes");
const documentRoutes = require("./routes/documentRoutes");
const uploadRoutes = require("./routes/upload");
const db = require("./db");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const app = express();
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api', require('./routes/documentTypeRoutes'));
app.use("/api/documents", documentRoutes);
app.use("/api/grants", grantRoutes);
app.use('/api', require('./routes/grantCategoryRoutes'));
app.use("/api", loginRoutes);
app.use("/api", uploadRoutes);

const PORT = parseInt(process.env.PORT || "4000", 10);
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));

module.exports = app;