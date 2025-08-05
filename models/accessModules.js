const mongoose = require('mongoose');

const accessModuleSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // مثل "users", "dashboard"
  name: { type: String, required: true }, // اسم الموديول
  description: { type: String },
  accessor: [
    {
      label: { type: String }, // "Read", "Write"
      value: { type: String }, // "read", "write"
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Module', accessModuleSchema);
