const express = require("express");
const app = express();
// const userRoutes = require("./routes/userRoutes");
// const clientRoutes = require("./routes/clientRoutes");
// const countriesRoutes = require("./routes/countriesRoutes");
// const locationsRoutes = require("./routes/locationsRoutes");
// const categoriesRoutes = require("./routes/categoriesRoutes");
// const rolesRoutes = require("./routes/rolesRoutes");
// const permissionsRoutes = require("./routes/permissionsRoutes");
// const socialLinksRoutes = require("./routes/socialLinksRoutes");
// const aboutRoutes = require("./routes/aboutRoutes");
// const settingRoutes = require("./routes/settingRoutes");
// const dashboardRoutes = require("./routes/dashboardRoutes");

const cors = require("cors");
const mongoose = require("mongoose");
//const errorHandler = require("./middlewares/errorHandler");
require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
mongoose
  .connect("mongodb+srv://byitconnect:2KdhZIurltn7wAzU@cluster0.qnkrgwa.mongodb.net/", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// app.use("/api/users", userRoutes);
// app.use("/api/clients", clientRoutes);
// app.use("/api/countries", countriesRoutes);
// app.use("/api/locations", locationsRoutes);
// app.use("/api/categories", categoriesRoutes);
// app.use("/api/roles", rolesRoutes);
// app.use("/api/permissions", permissionsRoutes);
// app.use("/api/socialLinks", socialLinksRoutes);
// app.use("/api/about", aboutRoutes);
// app.use("/api/settings", settingRoutes);
// app.use("/api/dashboard", dashboardRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

app.use(errorHandler);
