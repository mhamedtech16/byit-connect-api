const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
_id:Number,
priority:Number,
hasChild: Boolean,
main: Boolean,
deleted: Boolean,
details:String,
categoryName_en:String,
categoryName_ar:String,
type:String,
searchKey:String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Categories', categorySchema);
