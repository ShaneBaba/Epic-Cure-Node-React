const express = require("express");
const cors = require("cors");
const grantRoutes = require("./routes/grantRoutes");
const loginRoutes = require("./routes/loginRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/grants", grantRoutes);

app.use("/api", loginRoutes);


const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
