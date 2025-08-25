const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullname: String,
    email: { type: String, unique: true },
    phone: { type: String},
    password: { type: String,required: true, select: false},
    deleted:Boolean,
    block:Boolean,
    active:Boolean,
    type: String,  // DSP, SALESMAN
    approved:Boolean,
    country:Number,
    verifycode:Number,
    verifyEmail:Boolean,
    verifyPhone:Boolean,
    invitationCode:String,
    fcmTokens:[String],
    parentUser:{type: String, require: true},
    authority:[String]
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
