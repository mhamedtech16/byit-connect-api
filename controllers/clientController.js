const Client = require('../models/Client');
const User = require('../models/User');
const Category = require('../models/Categories');
const Locations = require('../models/Locations');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.addClient = async (req, res) => {
  const lastUserSeq = await Client.findOne().sort({ seq: -1 });
  const newSeq = lastUserSeq ? lastUserSeq.seq + 1 : 1;

const {category, location}  = req.body
 var categoryObj={}
 var locationObj = {}
 if(category){
      categoryObj= await Category.find({ _id: { $in: category }})
 }
 if(location){
    locationObj= await Locations.find({ _id: { $in: location }}) }

  const { seq, clientName, clientPhone, fromPrice, toPrice, dontInformClient, user } = req.body;
  const currentUser = await User.findOne({_id:user.toString()});
console.log('parentUser',currentUser.parentUser);
  const parentUser = await User.findOne({_id:currentUser.parentUser.toString()});

  const client = await Client.create({seq:newSeq, clientName, clientPhone , userAdded: user, status: 'NEW', fromPrice, toPrice, dontInformClient, assignedTo: parentUser._id.toString(), category: categoryObj, location: locationObj});
  res.status(201).json({success:true,data:client});
};


////////////// Update Client
exports.updateClient = async (req, res) => {
  try {
    const clientId  = req.query.client; // 👈 ID من URL
    const updateData = req.body; // 👈 البيانات الجديدة

    const updatedClient = await Client.findByIdAndUpdate(clientId, updateData, {
      new: true, // يرجّع النسخة بعد التحديث
      runValidators: true // يشغّل الـ validation من الـ schema
    });

    if (!updatedClient) {
      return res.status(404).json({ message: 'العميل مش موجود' });
    }

    res.json(updatedClient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
};

////////////// ReAssign Client
exports.reAssignClient = async (req, res) => {
  try {
    const clientId  = req.body.clientId
    const user  = req.body.userId // 👈 البيانات الجديدة

    const updatedClient = await Client.findByIdAndUpdate(clientId, {assignedTo:user}, {
      new: true, // يرجّع النسخة بعد التحديث
      runValidators: true // يشغّل الـ validation من الـ schema
    });

    if (!updatedClient) {
      return res.status(404).json({ message: 'العميل مش موجود' });
    }

    res.json(updatedClient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
};


//////////
exports.getClient = async (req, res) => {

  const  clientId  = req.params.id;
   console.log("Params:", req.params);
  console.log('IDDD',clientId);
  const client = await Client.findOne({ _id: clientId });
  if (!client) return res.status(400).json({ message: 'Invalid credentials' });

  res.json({success:true, data:client});
};

exports.getClients = async (req, res) => {
  try {
    const userId = req.query.assignedTo;
    const userAdded = req.query.userAdded
    const status = req.query.status
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};
    if (userId) {
      query.assignedTo = userId;
    }
    if(userAdded){
      query.userAdded = userAdded
    }
    if(status){
      query.status = status
    }

    const [clients, total] = await Promise.all([
      Client.find(query).skip(skip).limit(limit),
      Client.countDocuments(query)
    ]);

    res.json({
      data: clients,
      total,
      page,
      limit
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
