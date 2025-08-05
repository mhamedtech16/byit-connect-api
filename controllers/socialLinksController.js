const SocialLinks = require('../models/Settings/SocialLinks');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


exports.addSocialLink = async (req, res) => {
  const { img, pgLink } = req.body;

  const social = await SocialLinks.create({img, pgLink });
  res.status(201).json({success:true,data: social});
};

exports.getSocialLinks = async (req, res) => {
  const social = await SocialLinks.find();
  res.json({data: social});
};
