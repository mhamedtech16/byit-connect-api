const express = require('express');
const router = express.Router();
const permissionsController = require('../controllers/permissionsController');
const authMiddleware = require('../middlewares/authMiddleware');


router.post('/addPermission',authMiddleware, permissionsController.addPermission);
//router.get('/getRole/:id',authMiddleware, rolesController.getRole);
//router.put('/updateRole',authMiddleware, rolesController.updateRole);
router.get('/',authMiddleware, permissionsController.getPermissions);

module.exports = router;
