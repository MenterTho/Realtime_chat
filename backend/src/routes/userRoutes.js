const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/', authenticateToken, isAdmin, userController.getAllUsers);
router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, upload.single('avatar'), userController.updateProfile);
router.delete('/:id', authenticateToken, isAdmin, userController.deleteUser);

module.exports = router;