const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');


//router.post('/addAbout',authMiddleware, dashboardController.addAbout);
//router.put('/updateAbout',authMiddleware, dashboardController.updateAbout);
router.get('/', dashboardController.getDashboard);

module.exports = router;
