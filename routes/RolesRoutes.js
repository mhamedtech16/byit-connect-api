const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/rolesController');
const authMiddleware = require('../middlewares/authMiddleware');


router.post('/addRole',authMiddleware, rolesController.addRole);
//router.get('/getRole/:id',authMiddleware, rolesController.getRole);
router.put('/updateRole',authMiddleware, rolesController.updateRole);
router.get('/',authMiddleware, rolesController.getRoles);
router.get('/accessModules',authMiddleware, rolesController.getAccessModules);

module.exports = router;
