const User = require('../models/User');
const Client = require('../models/Client');
const Countries = require('../models/Countries');
const Utils = require('../services/Utils')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { validateRequiredFields, checkUniqueFields } = require('../services/fieldValidator');
const { requestVerificationCode } = require('../services/verificationService');

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
  const parentUser = await User.findOne({invitationCode:invitationCode});
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
  const user = await User.findOne({ phone, block:false }).select('+password');
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
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

//////// Change Password
exports.changePassword = async (req, res) => {
  const { oldPassword, password, phone } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  const result = await User.updateOne(
      { phone: phone },
      { $set: { password: hashed } }
    );
console.log('UUU',phone,hashed);
  const cleanUser = await User.findOne({phone : phone}).select('-password'); /// Remove password from user object
  const userObject = cleanUser.toObject();

  res.status(201).json({user:userObject});
};

/////======
exports.forgotPassword = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ ok: false, message: 'من فضلك أدخل رقم الهاتف.' });
    }

    // normalize the phone number (نفس اللي في service عشان التوافق)
  //  const normalizedPhone = phone.startsWith('+') ? phone : '+2' + phone.replace(/^0/, '');

    // تحقق من وجود المستخدم
    const user = await User.findOne({ phone: phone });
    if (!user) {
      return res.status(404).json({ ok: false, message: 'هذا الرقم غير مسجل لدينا.' });
    }

    // الرقم موجود، أرسل كود التحقق
    const result = await requestVerificationCode({
      phone: phone,
      purpose: 'ResetPassword'
    });

    return res.json(result);
  } catch (err) {
    console.error('forgotPassword error:', err.message);
    return res.status(500).json({ ok: false, message: 'حدث خطأ أثناء تنفيذ الطلب.' });
  }
};
/////=====
exports.verifyCode = async (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) return res.status(400).json({ ok: false, message: 'الرجاء إدخال رقم الهاتف والرمز.' });

  try {
    const result = await verifyResetCode(phone, code);
    // result.resetToken => يُستخدم في خطوة تغيير كلمة المرور
    return res.json(result);
  } catch (err) {
    console.error('verifyCode error:', err.message);
    return res.status(400).json({ ok: false, message: err.message });
  }
};
////=====
exports.resetPassword = async (req, res) => {
  const { phone, code, newPassword } = req.body;

  if (!phone || !code || !newPassword) {
    return res.status(400).json({ ok: false, message: 'يرجى إدخال رقم الهاتف والرمز وكلمة المرور الجديدة.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ ok: false, message: 'كلمة المرور الجديدة ضعيفة جداً.' });
  }

  try {
    const pr = await PasswordReset.findOne({
      phone,
      used: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (!pr) {
      return res.status(400).json({ ok: false, message: 'الرمز غير صالح أو منتهي الصلاحية.' });
    }

    if (pr.attempts >= 5) {
      return res.status(400).json({ ok: false, message: 'تم تجاوز عدد المحاولات المسموح بها.' });
    }

    const isMatch = await bcrypt.compare(code, pr.codeHash);
    pr.attempts += 1;

    if (!isMatch) {
      await pr.save();
      return res.status(400).json({ ok: false, message: 'الرمز غير صحيح.' });
    }

    // الرمز صحيح، نحدث الباسورد
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ ok: false, message: 'المستخدم غير موجود.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // علمنا الرمز أنه استُخدم
    pr.used = true;
    await pr.save();

    return res.json({ ok: true, message: 'تم تعيين كلمة مرور جديدة بنجاح.' });
  } catch (err) {
    console.error('resetPassword error:', err.message);
    return res.status(500).json({ ok: false, message: 'حدث خطأ أثناء إعادة التعيين.' });
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

    // بنبني query object فاضي
    const query = {};

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

    const users = await User.find(query).select('-password');
    res.json({ data: users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
