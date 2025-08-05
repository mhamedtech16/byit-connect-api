const User = require('../models/User');
const Roles = require('../models/Roles');
const AccessModules = require('../models/accessModules');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');


exports.addRole = async (req, res) => {
  const { roleName,description, accessRight } = req.body;
  console.log('categorirrr',roleName);
  const role = await Roles.create({name:roleName, description,accessRight});
  res.status(201).json({success:true,data:role});
};

// exports.updateRole = async (req, res) => {
//   const { id } = req.params;
//   const { roleName, description, accessRight } = req.body;
//
//   const role = await Role.findByIdAndUpdate(
//     id,
//     { name : roleName, description, accessRight },
//     { new: true }
//   );
//
//   res.json(role);
// };


exports.updateRole=async (req, res) =>{

  try {
     const { _id, roleName, accessRight } = req.body;

console.log('accessRight');
     const role = await Roles.findById(_id);
     if (!role) return res.status(404).json({ success: false, message: 'Role not found' });

     // تأكد إن accessRight Map
     if (!(role.accessRight instanceof Map)) {
       role.accessRight = new Map();
     }

     for (const [key, value] of Object.entries(accessRight)) {
       if (Array.isArray(value) && value.length > 0) {
         role.accessRight.set(key, value);
       } else {
         role.accessRight.delete(key); // امسح الـ key لو الصلاحيات فاضية
       }
     }

     // تحويل الـ Map ل Object قبل الحفظ
     role.accessRight = Object.fromEntries(role.accessRight);

     await role.save();

     res.json({ success: true, data: role }); // ✅ دي المهمة!
   } catch (err) {
     console.error('Error updating role access:', err);
     res.status(500).json({ success: false, message: 'Internal server error' });
   }
}

exports.getRoles = async (req, res) => {

try{
    const roles = await Roles.find();

    const rolesWithUsers = await Promise.all(
      roles.map(async (role) => {
        const users = await User.find(
          { role: role._id.toString() },
          '_id name email role' // رجع الفيلدات المهمة بس
        );

        const roleObj = role.toObject();
        roleObj.accessRight = Object.fromEntries(role.accessRight || new Map());
        roleObj.users = users; // هتكون array دايمًا

        return roleObj;
      })
    );

  res.json(rolesWithUsers);
} catch (err) {
  console.error('Error fetching roles:', err);
  res.status(500).json({ message: 'Failed to fetch roles' });
}
//  res.json(roles);
};


////
exports.getAccessModules = async (req, res) => {
  const modules = await AccessModules.find();

    res.json({data: modules});
//  res.json(roles);
};
