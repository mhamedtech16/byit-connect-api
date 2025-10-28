const User = require('../models/User');
const Client = require('../models/Client');
const Countries = require('../models/Countries');
const Utils = require('../services/Utils')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { validateRequiredFields, checkUniqueFields } = require('../services/fieldValidator');
const { requestVerificationCode, verifyCode } = require('../services/verificationService');
const VerificationCode = require('../models/VerificationCode');

exports.signup = async (req, res) => {
  const requiredFields = ['fullname', 'email', 'password', 'type', 'country', 'phone'];
  const validation = validateRequiredFields(req.body, requiredFields);
  if (!validation.success) {
        return res.status(400).json({ error: validation.message });
      }

    const uniqueFields = ['email', 'phone'];
    const uniqueness = await checkUniqueFields(User, req.body, uniqueFields);
    if (!uniqueness.success) {
      return res.status(422).json({ error: uniqueness.message });
    }

  const { fullname, email, password, type, country, phone, invitationCode } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const parentUser = await User.findOne({invitationCode:invitationCode.toUpperCase()});
  console.log('parentUser',parentUser);
  const user = await User.create({ fullname, email, password: hashed, type, approved:true, country:country, verifycode:2354, verifyEmail:true, verifyPhone:true ,phone: phone, parentUser: parentUser._id, block : false});
  const cleanUser = await User.findById(user._id).select('-password'); /// Remove password from user object
  const userCountry = await Countries.findById(country)
  const userObject = cleanUser.toObject();
  userObject.country = userCountry
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '365d',
  });

  res.status(201).json({user:userObject,token});
};

exports.login = async (req, res) => {
  const { phone, password } = req.body;
  const user = await User.findOne({ phone, block:false, deleted: { $ne: true }  }).select('+password');
  if (!user) return res.status(401).json({ message: req.__('AUTH.USER_NOT_FOUND') });
  //const hashed = await bcrypt.hash(password, 10);
console.log('password',user);
  const isMatch = await bcrypt.compare(password, user.password);
  console.log('password',isMatch);
  if (!isMatch) return res.status(401).json({ message: req.__('AUTH.INVALID_CREDENTIALS') });
  const userObject = user.toObject();
  //userObject.id = user._id
  delete userObject.password;
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '365d',
  });


/// Calculate Earnings
  const earningsResult = await Client.aggregate([
    { $match: { userAdded: userObject._id.toString() } },
    {
      $group: {
        _id: null,
        earnings: { $sum: "$earnings" }
      }
    }
  ])

  const totalEarnings = earningsResult.length > 0 ? earningsResult[0].earnings : 0;
  // ✅ ضيف الأرباح داخل object المستخدم
  const userData = {
    id:user._id,
    ...userObject,
    totalEarnings
  };


  res.json({ user: {id:userObject._id, ...userData},token });
};

///////////////// Add New User
exports.addUser = async (req, res) => {
  const { fullname, email, password, type, country, phone } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const invitationCode = await Utils.generateUniqueInviteCode();
  const user = await User.create({ fullname, email, password: hashed, type, approved:true, country:country, verifycode:2354, verifyEmail:true, verifyPhone:true ,phone: phone, invitationCode: invitationCode, block:false});
  const cleanUser = await User.findById(user._id).select('-password'); /// Remove password from user object
  const userCountry = await Countries.findById(country)
  const userObject = cleanUser.toObject();
  userObject.country = userCountry
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '365d',
  });

  res.status(201).json({user:userObject,token});
};

///// Set New PasswordReset
exports.setNewPassword = async (req, res) => {
  try {
    const currentUser = req.user;
    const { phone, password } = req.body;


    // جلب المستخدم من قاعدة البيانات
    const user = await User.findOne({ phone: phone }).select('+password');;

    if (!user) {
      return res.status(404).json({ error: req.__('AUTH.USER_NOT_FOUND') });
    }

    // تشفير كلمة المرور الجديدة
    const hashed = await bcrypt.hash(password, 10);
console.log('userrrr',phone, hashed);
    // تحديث كلمة المرور
    await User.updateOne(
      { phone: user.phone },
      { $set: { password: hashed } }
    );

    // جلب بيانات المستخدم بدون كلمة المرور
  //  const cleanUser = await User.findOne({ phone: user.phone }).select('-password');
  //  const userObject = cleanUser.toObject();

    res.status(200).json({ data: true, message:  req.__('AUTH.PASSWORD_CHANGED')  });

  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ error: req.__('AUTH.RESET_ERROR')});
  }
};
//////// Change Password
exports.changePassword = async (req, res) => {
  try {
    const currentUser = req.user;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: req.__('AUTH.OLD_PASSWORD_REQUIRED')  });
    }

    // جلب المستخدم من قاعدة البيانات
    const user = await User.findOne({ _id: currentUser.id }).select('+password');;

    if (!user) {
      return res.status(404).json({ error: req.__('AUTH.USER_NOT_FOUND') });
    }

    // مقارنة كلمة المرور القديمة
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: req.__('AUTH.OLD_PASSWORD_INCORRECT')  });
    }

    // تشفير كلمة المرور الجديدة
    const hashed = await bcrypt.hash(newPassword, 10);

    // تحديث كلمة المرور
    await User.updateOne(
      { phone: user.phone },
      { $set: { password: hashed } }
    );

    // جلب بيانات المستخدم بدون كلمة المرور
    const cleanUser = await User.findOne({ phone: user.phone }).select('-password');
    const userObject = cleanUser.toObject();

    res.status(200).json({ user: userObject, message:  req.__('AUTH.PASSWORD_CHANGED')  });

  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ error: req.__('AUTH.RESET_ERROR')});
  }
};

/////======
exports.forgotPassword = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ ok: false, message: req.__('AUTH.PHONE_REQUIRED') });
    }

    // normalize the phone number (نفس اللي في service عشان التوافق)
  //  const normalizedPhone = phone.startsWith('+') ? phone : '+2' + phone.replace(/^0/, '');

    // تحقق من وجود المستخدم
    const user = await User.findOne({ phone: phone });
    if (!user) {
      return res.status(404).json({ ok: false, message: req.__('AUTH.PHONE_NOT_REGISTERED') });
    }

    // الرقم موجود، أرسل كود التحقق
    const result = await requestVerificationCode({
      phone: phone,
      purpose: 'ResetPassword'
    });

    return res.json(result);
  } catch (err) {
    console.error('forgotPassword error:', err.message);
    return res.status(500).json({ ok: false, message: req.__('GENERAL.REQUEST_FAILED')  });
  }
};
/////===== verify Code
exports.verifyCode = async (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) return res.status(400).json({ ok: false, message: req.__('AUTH.CODE_REQUIRED')});

  try {

    const result = await verifyCode({phone, code});
    // result.resetToken => يُستخدم في خطوة تغيير كلمة المرور
    return res.json(result);
  } catch (err) {
    console.error('verifyCode error:', err.message);
    return res.status(400).json({ ok: false, message: err.message });
  }
};
////=====

/**
 * resetPasswordWithCode
 * body: { phone, code, newPassword }
 */
exports.resetPasswordWithCode = async (req, res) => {
  try {
    const { phone, code, newPassword } = req.body;

    if (!phone || !code || !newPassword) {
      return res.status(400).json({ ok: false, message:  req.__('VALIDATION.RESET_FIELDS_REQUIRED') });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ ok: false, message: req.__('VALIDATION.NEW_PASSWORD_TOO_SHORT') });
    }

  //  const normalizedPhone = normalizeEgyptPhone(phone);

    // جلب أحدث كود صالح من نوع reset_password
    const now = new Date();
    const vc = await VerificationCode.findOne({
      phone: phone,
      type: 'ResetPassword',
      //used: false,
      expiresAt: { $gt: now }
    }).sort({ createdAt: -1 });
console.log('phoneee',vc);
    if (!vc) {
      return res.status(400).json({ ok: false, message: req.__('AUTH.INVALID_OR_EXPIRED_CODE') });
    }

    if (vc.attempts >= 5) {
      return res.status(429).json({ ok: false, message: req.__('AUTH.TOO_MANY_ATTEMPTS') });
    }

    // قارن الكود المقدم مع الهَش
    const isMatch = await bcrypt.compare(code, vc.codeHash);

    // زد عدد المحاولات واحفظ (إذا فشل أو نجح نحفظ الزيادة أولًا للحد من الاستغلال)
    vc.attempts = (vc.attempts || 0) + 1;

    if (!isMatch) {
      await vc.save();
      return res.status(400).json({ ok: false, message: req.__('AUTH.CODE_INCORRECT') });
    }

    // الكود صحيح -> تأكد من وجود المستخدم
    const user = await User.findOne({ phone: phone });
    if (!user) {
      // نعلم الكود كمستخدم لحمايته من إعادة استعمال، لكن نُرجع رسالة عامة
      vc.used = true;
      await vc.save();
      return res.status(404).json({ ok: false, message: req.__('AUTH.USER_NOT_FOUND')});
    }

    // هاش الباسورد الجديد وحفظه
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // علم الكود أنه استُخدم
    vc.used = true;
    await vc.save();

    // اختياري: تعطيل/حذف أكواد أخرى لنفس الهاتف وغرض reset_password
    try {
      await VerificationCode.updateMany(
        { phone: phone, type: 'ResetPassword', used: false },
        { $set: { used: true } }
      );
    } catch (e) {
      console.warn('Warning: failed to mark other codes used:', e.message);
    }

    return res.json({ ok: true, message: req.__('AUTH.PASSWORD_CHANGED') });
  } catch (err) {
    console.error('resetPasswordWithCode error:', err);
    return res.status(500).json({ ok: false, message: req.__('AUTH.RESET_ERROR') });
  }
};

/////////////

///////////////  get single User
exports.getUser = async (req, res) => {
  const userId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
     return res.status(400).json({ error: 'Invalid user ID' });
   }

  const user = await User.findOne({_id:new mongoose.Types.ObjectId(userId)}).select('-password');

  const earningsResult = await Client.aggregate([
    { $match: { userAdded: userId } },
    {
      $group: {
        _id: null,
        earnings: { $sum: "$earnings" }
      }
    }
  ])

  const totalEarnings = earningsResult.length > 0 ? earningsResult[0].earnings : 0;

  // ✅ ضيف الأرباح داخل object المستخدم
  const userData = {
    id:user._id,
    ...user.toObject(),
    totalEarnings
  };

  res.json({data: userData});
};


///////////////  get Users
exports.getUsers = async (req, res) => {
  try {
    const { type, status } = req.query;
    const querySearch = req.query.query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // بنبني query object فاضي
    const query = {deleted: { $ne: true } };
    query.block = false
    if (type) {
      query.type = type;   // لو في role نحطه
    }

    if (status) {
      query.block = status =='active'? false : true ;  // لو في status نحطه
    }

     if (querySearch) {
    query.$or = [
      { fullname: { $regex: querySearch, $options: 'i' } },
      { email: { $regex: querySearch, $options: 'i' } },
      { phone: { $regex: querySearch, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query)
  ]);

    //const users = await User.find(query).select('-password');

    res.json({
        data: users,
        total,
        page,
        limit
    });
  //  res.json({ data: users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: req.__('GENERAL.SERVER_ERROR')});
  }
};

////===== Delete User
exports.deleteUser = async (req, res)=>{
  const id = req.params.id
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { deleted: true })
    if (!user) {
      return res.status(404).json({ message: req.__('AUTH.USER_NOT_FOUND') });
    }
    res.json({ message: req.__('USER_DELETED_SUCCESSFULLY') });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: req.__('GENERAL.SERVER_ERROR') });
  }
};
