const mongoose = require('mongoose');

const permissionsSchema = new mongoose.Schema(
  {
    name: {
      type: String,  /// Clients or any page name
      required: true,
      unique: true, // كل اسم رول يكون مختلف
    },
    permissionActions: {
      type: [String],
      default: []
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Permissions', permissionsSchema);
