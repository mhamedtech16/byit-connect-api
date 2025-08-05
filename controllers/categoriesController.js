const Categories = require('../models/Categories');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


exports.getCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};


    const [categories, total] = await Promise.all([
      Categories.find(query).skip(skip).limit(limit),
      Categories.countDocuments(query)
    ]);

    res.json({
      data: categories,
      total,
      page,
      limit
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
