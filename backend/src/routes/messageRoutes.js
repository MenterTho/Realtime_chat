const express = require('express');
const messageController = require('../controller/messageController');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/:userId', authenticateToken, messageController.getMessages);
router.post('/', authenticateToken, upload.single('file'), messageController.sendMessage);

module.exports = router;