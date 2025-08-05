const express = require('express');
const router = express.Router();
const socialLinksController = require('../controllers/socialLinksController');
const authMiddleware = require('../middlewares/authMiddleware');


router.post('/addSocialLink',authMiddleware, socialLinksController.addSocialLink);
//router.put('/updateSocialLink',authMiddleware, socialLinksController.updateSocialLink);
router.get('/',authMiddleware, socialLinksController.getSocialLinks);

module.exports = router;
