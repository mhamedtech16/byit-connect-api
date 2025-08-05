const About = require('../models/Settings/About');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



exports.addAbout = async (req, res) => {
  const { title_en, title_ar, description_en, description_ar,img,
  facebook,
  instagram,
  website,
  whatsapp,
  phone } = req.body;

  const about = await About.create({title_en, title_ar, description_en, description_ar,img,
  facebook,
  instagram,
  website,
  whatsapp,
  phone });
  res.status(201).json({success:true,data: about});
};



exports.updateAbout = async (req, res) => {
  const { title_en, title_ar, description_en, description_ar,img,
  facebook,
  instagram,
  website,
  whatsapp,
  phone } = req.body;

  const updatedDoc = await About.findOneAndUpdate(
    {},
    { $set: { title_en, title_ar, description_en, description_ar,img,
    facebook,
    instagram,
    website,
    whatsapp,
    phone } },
    { new: true, runValidators: true }
  )
  // const about = await About.findByIdAndUpdate(,{title_en, title_ar, description_en, description_ar,img,
  // facebook,
  // instagram,
  // website,
  // whatsapp,
  // phone });
  res.status(201).json({success:true,data: about});
};

exports.getAbout = async (req, res) => {
  const about = await About.find();
  res.json({data: about});
};
