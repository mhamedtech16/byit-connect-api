const User = require('../models/User');
const Permissions = require('../models/Permissions');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.addPermission = async (req, res) => {
  const { permissionName, permissionActions } = req.body;
  console.log('categorirrr',permissionName);
  const role = await Permissions.create({name: permissionName, permissionActions });
  res.status(201).json({success:true,data:role});
};

exports.getPermissions = async (req, res) => {
  const permissions = await Permissions.find();
  res.json(permissions);
};
