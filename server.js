const express = require("express");
const app = express();
const userRoutes = require("./routes/userRoutes");
const clientRoutes = require("./routes/clientRoutes");
const countriesRoutes = require("./routes/countriesRoutes");
const locationsRoutes = require("./routes/locationsRoutes");
const categoriesRoutes = require("./routes/categoriesRoutes");
const rolesRoutes = require("./routes/rolesRoutes");
const permissionsRoutes = require("./routes/permissionsRoutes");
const socialLinksRoutes = require("./routes/socialLinksRoutes");
const aboutRoutes = require("./routes/aboutRoutes");
const settingRoutes = require("./routes/settingRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const i18n = require('i18n');
const path = require('path');

const cors = require("cors");
const mongoose = require("mongoose");
const errorHandler = require("./middlewares/errorHandler");
require("dotenv").config();

//////// Language

i18n.configure({
  locales: ['en', 'ar'],
  directory: path.join(__dirname, 'locales'),
  defaultLocale: 'en',
  queryParameter: 'lang',
  header: 'accept-language',
  autoReload: true,
  syncFiles: true,
  objectNotation: true
});
app.use(i18n.init);


///////=====
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ فعل كل الـ routes قبل listen
app.use("/api/users", userRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/countries", countriesRoutes);
app.use("/api/locations", locationsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/roles", rolesRoutes);
app.use("/api/permissions", permissionsRoutes);
app.use("/api/socialLinks", socialLinksRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(errorHandler);

// ✅ connect to MongoDB الأول، وبعدها شغّل السيرفر
const PORT = process.env.PORT || 8080;

//mongoose.connect("mongodb://127.0.0.1:27017/byitconnect_db", {
mongoose
  .connect(
    "mongodb+srv://byitconnect:2KdhZIurltn7wAzU@cluster0.qnkrgwa.mongodb.net/byitconnect_db",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`✅ Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // ❌ exit app if db fails
  });
