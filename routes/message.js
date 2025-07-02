const express = require('express');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
const { sendMessage, getMessagesByChat, markMessagesAsRead} = require('../controllers/messageController');

router.post('/', protect, sendMessage);
router.get('/:chatId', getMessagesByChat);
router.post('/mark-read', markMessagesAsRead);

module.exports = router;
