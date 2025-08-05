const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    seq:{type:Number, require:true},
    clientName: String,
    clientPhone: String,
    userAdded: {type: String, require: true},
    status:{type: String, require:true},
    fromPrice:{type:Number, require: true},
    toPrice:{type:Number, require: true},
    location:{type: Object, require: true},
    category:{type: Object, require: true},
    dontInformClient: Boolean,
    assignedTo: {type: String, require: true}, /// id of sales employee
  },
  { timestamps: true }
);

module.exports = mongoose.model('Client', clientSchema);
