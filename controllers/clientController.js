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

  const { clientName, clientPhone, fromPrice, toPrice, dontInformClient, user } = req.body;
  const currentUser = await User.findOne({_id:user.toString()});
console.log('parentUser',currentUser.parentUser);
  const parentUser = await User.findOne({_id:currentUser.parentUser.toString()});

  const client = await Client.create({seq:newSeq, clientName, clientPhone , userAdded: user, status: 'NEW', fromPrice, toPrice, dontInformClient, assignedTo: parentUser._id.toString(), category: categoryObj, location: locationObj});
  res.status(201).json({success:true,data:client});
};


////////////// Update Client
exports.updateClient = async (req, res) => {
  try {
    //const clientId  = req.query.client; // 👈 ID من URL
    const updateData = req.body; // 👈 البيانات الجديدة
    const _id = updateData.clientId;
    console.log('updateData',updateData);
    const updatedClient = await Client.findByIdAndUpdate(_id, updateData, {
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
  try {
    const clientId = req.params.id;

    // 1. Find the client by ID
    const client = await Client.findOne({ _id: clientId });

    // 2. If the client doesn't exist, return a 404 response
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found.',
      });
    }

    const user = await User.findOne({ _id: client.userAdded });

    const clientObject = client.toObject();

    clientObject.userAdded = user;

    res.json({
      success: true,
      data: clientObject,
    });
  } catch (err) {
    // 7. Handle any errors that occur
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error.',
      error: err.message,
    });
  }
};

exports.getClients = async (req, res) => {
    try {
        const user = req.user;
        const assignedTo = req.query.assignedTo;
        const userAdded = req.query.userAdded
        const status = req.query.status
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const loggedInUser = await User.findById(user.id).select('+authority');
        const userAuthority = loggedInUser?.authority || [];

        let query = {};

        if (userAuthority.includes('ADMIN') || userAuthority.includes('SALESMNGR')) {
            if (assignedTo) {
                query.assignedTo = assignedTo;
            }
        } else if (userAuthority.includes('SALESMAN')) {
            query.assignedTo = loggedInUser._id;
        } else if (loggedInUser.type == 'DSP') {
            query.userAdded = loggedInUser._id;
        } else {
            return res.status(403).json({ message: 'Permission denied.' });
        }

        if (userAdded) {
            query.userAdded = userAdded;
        }
        if (status) {
            query.status = status;
        }

        const [clients, total] = await Promise.all([
            Client.find(query).skip(skip).limit(limit),
            Client.countDocuments(query)
        ]);

        // ... (rest of your code for mapping and returning data)
        // Note: The rest of the function remains the same, as the query is now correctly filtered.

        if (clients.length === 0) {
            return res.json({
                data: [],
                total,
                page,
                limit
            });
        }

        const clientPromises = clients.map(client =>
            User.findOne({ _id: client.userAdded })
        );
        const relatedDataResults = await Promise.all(clientPromises);

        const clientsWithRelatedData = clients.map((client, index) => {
            const clientObject = client.toObject();
            clientObject.userAdded = relatedDataResults[index];
            return clientObject;
        });

        res.json({
            data: clientsWithRelatedData,
            total,
            page,
            limit
        });

    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
