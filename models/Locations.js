const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
_id:Number,
deleted: Boolean,
name_en:String,
name_ar:String,
type:String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Locations', locationSchema);
