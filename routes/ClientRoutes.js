const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const authMiddleware = require('../middlewares/authMiddleware');


router.post('/addClient',authMiddleware, clientController.addClient);
router.get('/getClient/:id',authMiddleware, clientController.getClient);
router.put('/updateClient',authMiddleware, clientController.updateClient);
router.put('/reAssignClient',authMiddleware, clientController.reAssignClient);
router.get('/',authMiddleware, clientController.getClients);

module.exports = router;
