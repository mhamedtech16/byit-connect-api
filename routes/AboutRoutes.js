const express = require('express');
const router = express.Router();
const aboutController = require('../controllers/aboutController');
const authMiddleware = require('../middlewares/authMiddleware');


router.post('/addAbout',authMiddleware, aboutController.addAbout);
router.put('/updateAbout',authMiddleware, aboutController.updateAbout);
router.get('/getAbout', aboutController.getAbout);

module.exports = router;
