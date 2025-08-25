const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');


router.get('/getSetting', settingController.getSetting);

module.exports = router;
