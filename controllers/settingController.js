const Settings = require('../models/Settings/Setting');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

exports.getSetting = async (req, res) => {
  const settings = await Settings.findOne();
  res.json({data: settings});
};
