const User = require('../models/User');

 async function generateUniqueInviteCode(length = 5) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  let code;
  let exists = true;

  while (exists) {
    // 1. توليد كود عشوائي
    code = Array.from({ length }, () =>
      characters.charAt(Math.floor(Math.random() * characters.length))
    ).join('');

    // 2. فحص إذا كان موجود
    const existingUser = await User.findOne({ invitationCode: code });
    exists = !!existingUser; // true لو موجود
  }

  return code;
}


module.exports = {
  generateUniqueInviteCode,
};
