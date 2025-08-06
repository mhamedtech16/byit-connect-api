const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categoriesController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', categoriesController.getCategories);
module.exports = router;
