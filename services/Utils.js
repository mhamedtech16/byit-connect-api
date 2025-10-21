const User = require('../models/User');
const axios = require('axios');

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


////===== send OTP SMS

async function sendOtpSMS({ to, message }) {
  const username = process.env.SMS_USERNAME;
  const password = process.env.SMS_PASSWORD;
  const sendername = process.env.SMS_SENDER;
  const baseUrl = process.env.SMS_API_BASE || 'https://smssmartegypt.com/sms/api/';

  if (!username || !password || !sendername) {
    throw new Error('بيانات مزود خدمة SMS ناقصة. تحقق من ملف .env');
  }

  const params = new URLSearchParams({
    username,
    password,
    sendername,
    message,
    mobiles: to
  });

  const url = `${baseUrl}?${params.toString()}`;

  try {
    const response = await axios.get(url, { timeout: 10000 }); // 10 ثواني مهلة
    console.log('SMS Response:', response.data); // لمتابعة الاستجابة
    return { ok: true, providerResponse: response.data };
  } catch (err) {
    console.error('SMS Error:', err.message);
    throw new Error('فشل إرسال رسالة SMS.');
  }
}




module.exports = {
  generateUniqueInviteCode,
  sendSms
};
