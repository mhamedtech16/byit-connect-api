const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    iosAppVersion: String,
    androidAppVersion: String,
    deleted: Boolean
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', settingSchema);
