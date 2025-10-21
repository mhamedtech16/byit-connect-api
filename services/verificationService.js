// services/verificationService.js
require('dotenv').config();
const bcrypt = require('bcrypt');
const VerificationCode = require('../models/VerificationCode'); // أو '../models/PasswordReset' لو اسم الموديل القديم
const User = require('../models/User');
const sendOtpSMS = require('../services/Utils');

const CODE_LENGTH = parseInt(process.env.CODE_LENGTH || '4', 10);
const CODE_TTL_MINUTES = parseInt(process.env.CODE_TTL_MINUTES || '10', 10);
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || '10', 10);
const RESEND_COOLDOWN_SECONDS = parseInt(process.env.RESEND_COOLDOWN_SECONDS || '60', 10);
const MAX_SAME_PHONE_ACTIVE = parseInt(process.env.MAX_SAME_PHONE_ACTIVE || '5', 10);

// توليد كود رقمي بطول ثابت
function generateNumericCode(len = CODE_LENGTH) {
  let code = '';
  for (let i = 0; i < len; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }
  return code;
}

// تحويل بسيط لصيغة E.164 لمصر لو لازم (افتراضي لو الرقم يبدأ بـ0)
function normalizeEgyptPhone(phone) {
  if (!phone) return phone;
  let p = phone.trim();
  // لو بيمرر +20 بالفعل، نخليها كما هي
  if (p.startsWith('+')) return p;
  // لو بدأ بـ 0 and length 11 => 010XXXXXXXX => +2010...
  if (p.startsWith('0')) return '+2' + p;
  // ممكن يكون بدون صفر: 10XXXXXXXX => +2010...
  if (/^\d{10,11}$/.test(p)) return '+2' + p.replace(/^0/, '');
  return p; // fallback: كما هو
}

/**
 * requestVerificationCode
 * purpose: 'reset_password', 'activate_account', 'change_phone', ...
 */
async function requestVerificationCode({ phone, purpose = 'ResetPassword' }) {
  if (!phone) throw new Error('رقم الهاتف مطلوب.');

  const normalizedPhone = normalizeEgyptPhone(phone);

  // قبل إنشاء الكود: تأكد إن الحساب موجود (لـ reset_password)
  if (purpose === 'ResetPassword') {
    const user = await User.findOne({ phone: normalizedPhone });
    if (!user) {
      // لا نكشف وجود الحساب: نُعيد رد عام بدون إنشاء أو إرسال SMS
      return { ok: true, message: 'إذا كان الرقم مسجلاً، سترسل رسالة له برمز التحقق.' };
    }
  }

  // تحقق من وجود طلب حديث لمنع إعادة الإرسال السريعة (cooldown)
  const now = new Date();
  const recent = await VerificationCode.findOne({
    phone: normalizedPhone,
    type: purpose,
    used: false
  }).sort({ createdAt: -1 });

  if (recent) {
    const secsSince = (now - recent.createdAt) / 1000;
    if (secsSince < RESEND_COOLDOWN_SECONDS) {
      // لا نكشف المدة للعميل كثيرًا — نُرجع رسالة عامة أو خطأ منطقي حسب رغبتك
      const wait = Math.ceil(RESEND_COOLDOWN_SECONDS - secsSince);
      throw new Error(`Too soon to resend. Wait ${wait} seconds.`);
    }

    // لمنع تراكم سجلات كثيرة لنفس الشخص: نحذف أو نعلم السجلات القديمة إذا عددهم كبير
    const activeCount = await VerificationCode.countDocuments({
      phone: normalizedPhone,
      type: purpose,
      used: false,
      expiresAt: { $gt: now }
    });

    if (activeCount >= MAX_SAME_PHONE_ACTIVE) {
      // سياسة: امنع إنشاء المزيد مؤقتًا
      throw new Error('تم إرسال الكثير من الأكواد لهذا الرقم. حاول لاحقًا.');
    }
  }

  // توليد الكود، هاش، وحفظ
  const code = generateNumericCode(CODE_LENGTH);
  const codeHash = await bcrypt.hash(code, SALT_ROUNDS);
  const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);

  const vc = new VerificationCode({
    phone: normalizedPhone,
    codeHash,
    type: purpose,
    expiresAt
  });

  await vc.save();

  // نص الرسالة: عدّله حسب لغتك/علامتك
//  const text = `رمز التحقق: ${code}. صالح ${CODE_TTL_MINUTES} دقائق.`;
  const text = `Your Byit verification code is ${code} .Do not share this code with `

  try {
    const smsResp = await sendOtpSMS({ to: normalizedPhone, message: text });
    // سجّل استجابة المزود (للدباغing) لكن لا تحتفظ بالكود النصي
    console.info('SMS provider response:', smsResp.providerResponse || smsResp);
  } catch (err) {
    console.error('Failed to send SMS:', err.message);
    // اختيار: تحذف السجل لو فشل الإرسال حتى لا يظل أكواد بلا هدف
    try {
      await VerificationCode.deleteOne({ _id: vc._id });
    } catch (e) { /* ignore */ }

    throw new Error('فشل في إرسال رسالة SMS. حاول مرة أخرى لاحقًا.');
  }

  // رد عام للعميل — لا نكشف إن الرقم موجود أم لا
  return { ok: true, message: 'إذا كان الرقم مسجلاً، سترسل رسالة له برمز التحقق.' };
}

module.exports = {
  requestVerificationCode,
  generateNumericCode
};
