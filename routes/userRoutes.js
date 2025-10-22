const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');
const upload = multer();

router.post('/signup', upload.none(), userController.signup);
router.post('/login', userController.login); // 👈 غير محمي
router.get('/', authMiddleware, userController.getUsers); // 👈 محمي
router.get('/getUser/:id', authMiddleware, userController.getUser); // 👈 محمي
router.post('/addUser', authMiddleware, userController.addUser); // 👈 محمي
router.put('/changePassword', authMiddleware, userController.changePassword); // 👈 محمي
router.post('/forgotPassword', userController.forgotPassword);
router.post('/resetPasswordWithCode', userController.resetPasswordWithCode);
router.post('/verifyCode', userController.verifyCode);



module.exports = router;
