const Locations = require('../models/Locations');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


exports.getLocations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};


    const [locations, total] = await Promise.all([
      Locations.find(query).skip(skip).limit(limit),
      Locations.countDocuments(query)
    ]);

    res.json({
      data: locations,
      total,
      page,
      limit
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
