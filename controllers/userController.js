const User = require('../models/User');
const Countries = require('../models/Countries');
const Utils = require('../services/Utils')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { validateRequiredFields, checkUniqueFields } = require('../services/fieldValidator');

exports.signup = async (req, res) => {
  const requiredFields = ['fullname', 'email', 'password', 'type', 'country', 'phone'];
  const validation = validateRequiredFields(req.body, requiredFields);
  if (!validation.success) {
        return res.status(400).json({ error: validation.message });
      }

    const uniqueFields = ['email', 'phone'];
    const uniqueness = await checkUniqueFields(User, req.body, uniqueFields);
    if (!uniqueness.success) {
      return res.status(422).json({ error: uniqueness.message });
    }

  const { fullname, email, password, type, country, phone, invitationCode } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const parentUser = await User.findOne({invitationCode:invitationCode});
  console.log('parentUser',parentUser);
  const user = await User.create({ fullname, email, password: hashed, type, approved:true, country:country, verifycode:2354, verifyEmail:true, verifyPhone:true ,phone: phone, parentUser: parentUser._id, block : false});
  const cleanUser = await User.findById(user._id).select('-password'); /// Remove password from user object
  const userCountry = await Countries.findById(country)
  const userObject = cleanUser.toObject();
  userObject.country = userCountry
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '365d',
  });

  res.status(201).json({user:userObject,token});
};

exports.login = async (req, res) => {
  const { phone, password } = req.body;
  const user = await User.findOne({ phone, block:false }).select('+password');
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
  const userObject = user.toObject();
  //userObject.id = user._id
  delete userObject.password;
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '365d',
  });

  res.json({ user: {id:userObject._id, ...userObject},token });
};

///////////////// Add New User
exports.addUser = async (req, res) => {
  const { fullname, email, password, type, country, phone } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const invitationCode = await Utils.generateUniqueInviteCode();
  const user = await User.create({ fullname, email, password: hashed, type, approved:true, country:country, verifycode:2354, verifyEmail:true, verifyPhone:true ,phone: phone, invitationCode: invitationCode, block:false});
  const cleanUser = await User.findById(user._id).select('-password'); /// Remove password from user object
  const userCountry = await Countries.findById(country)
  const userObject = cleanUser.toObject();
  userObject.country = userCountry
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '365d',
  });

  res.status(201).json({user:userObject,token});
};

//////// Change Password
exports.changeUserPassword = async (req, res) => {
  const { password, phone } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  const result = await User.updateOne(
      { phone: phone },
      { $set: { password: hashed } }
    );
console.log('UUU',phone,hashed);
  const cleanUser = await User.findOne({phone : phone}).select('-password'); /// Remove password from user object
  const userObject = cleanUser.toObject();

  res.status(201).json({user:userObject});
};

///////////////  get single User
exports.getUser = async (req, res) => {
  const userId = req.params.id;
  console.log('tttttt',userId)
  if (!mongoose.Types.ObjectId.isValid(userId)) {
     return res.status(400).json({ error: 'Invalid user ID' });
   }

  const user = await User.findOne({_id:new mongoose.Types.ObjectId(userId)}).select('-password');
  res.json({data: user});
};


///////////////  get Users
exports.getUsers = async (req, res) => {
  try {
    const { role, status } = req.query;
    const querySearch = req.query.query

    // بنبني query object فاضي
    const query = {};

    if (role) {
      query.type = role;   // لو في role نحطه
    }

    if (status) {
      query.block = status =='active'? false : true ;  // لو في status نحطه
    }

     if (querySearch) {
    query.$or = [
      { fullname: { $regex: querySearch, $options: 'i' } },
      { email: { $regex: querySearch, $options: 'i' } },
      { phone: { $regex: querySearch, $options: 'i' } },
    ];
  }

    const users = await User.find(query).select('-password');
    res.json({ data: users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
