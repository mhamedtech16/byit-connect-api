const Countries = require('../models/Countries');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.getCountries = async (req, res) => {
  const countries = await Countries.find();
  res.json({data: countries});
};
