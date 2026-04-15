const express = require("express");
const cors = require("cors");
const path = require("path");
const grantRoutes = require("./routes/grantRoutes");
const loginRoutes = require("./routes/loginRoutes");
const documentRoutes = require("./routes/documentRoutes");
const uploadRoutes = require("./routes/upload");
const faqRoutes = require("./routes/faqRoutes");
const faqCategoryRoutes = require("./routes/faqCategoryRoutes");
const db = require("./db");
const adminRoutes = require('./routes/adminRoutes');
const accountRoutes = require('./routes/accountRoutes');

console.log("adminRoutes loaded");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Epic Cure backend is running");
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api', require('./routes/documentTypeRoutes'));
app.use("/api/documents", documentRoutes);
app.use("/api/grants", grantRoutes);
app.use('/api', require('./routes/grantCategoryRoutes'));
app.use("/api", loginRoutes);
app.use("/api", uploadRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/account", accountRoutes);
app.use("/api", faqRoutes);
app.use("/api", faqCategoryRoutes);

const PORT = parseInt(process.env.PORT || "4000", 10);
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));

module.exports = app;