const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema(
  {
    title_en: String,
    title_ar: String,
    description_en: {type: String, require: true},
    description_ar:{type: String, require:true},
    img: String,
    facebook:String,
    instagram:String,
    website:String,
    whatsapp:String,
    phone:String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('About', aboutSchema);
