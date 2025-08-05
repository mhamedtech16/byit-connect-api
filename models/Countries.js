const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema(
  {
_id:Number,
hint:String,
deleted: Boolean,
name_en: String,
name_ar: String,
countryCode: String,
isoCode: String,
numbersCount: Number,
img: String
  },
  { timestamps: true }
);

module.exports = mongoose.model('Countries', countrySchema);
