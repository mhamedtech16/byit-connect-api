const mongoose = require('mongoose');

const socialLinksSchema = new mongoose.Schema(
  {
    img: String,
    facebook:String,
    instagram:String,
    website:String,
    whatsapp:String,
    phone:String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('SocialLinks', socialLinksSchema);
