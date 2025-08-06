const express = require('express');
const router = express.Router();
const locationsController = require('../controllers/locationsController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', locationsController.getLocations);
module.exports = router;
