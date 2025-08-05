const Client = require('../models/Client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.getDashboard = async (req, res) => {
  try {
    let query = {};
    query.status = 'SALEDONE';
    const count = await Client.countDocuments()
    const saleDoneCount = await Client.countDocuments(query)
    res.json({
      data : {
        totalClients: count,
      totalSaleDone:saleDoneCount
    }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
