const mongoose = require('mongoose');

const rolesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // كل اسم رول يكون مختلف
      //enum: ['Admin', 'Sub Admin', 'Sales Manager', 'Editor', 'Viewer'] // لو حابب تضبطها
    },
    description:String,
    accessRight: {
    type: Map,
    of: [String], // كل قيمة هي array of strings
    default: {},
  },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Roles', rolesSchema);
