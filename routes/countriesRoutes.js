const express = require('express');
const router = express.Router();
const countriesController = require('../controllers/countriesController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', countriesController.getCountries);

module.exports = router;
