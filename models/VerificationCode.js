const mongoose = require('mongoose');

const VerificationCodeSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    index: true
  },
  codeHash: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['ResetPassword', 'ActivateAccount', 'ChangePhone']
  },
  attempts: {
    type: Number,
    default: 0
  },
  used: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  }
});

// TTL index: يحذف السجل تلقائيًا بعد انتهاء صلاحيته
VerificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('VerificationCode', VerificationCodeSchema);
