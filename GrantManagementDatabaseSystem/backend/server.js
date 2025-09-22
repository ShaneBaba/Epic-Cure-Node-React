const express = require("express");
const cors = require("cors");
const grantRoutes = require("./routes/grantRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/grants", grantRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
