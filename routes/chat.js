const express = require('express');
const router = express.Router();
const { createChat, getChatsByUser , joinChat, getChatByEvent} = require('../controllers/chatController');

router.post('/', createChat);
router.post('/join/:chatId', joinChat);
router.get('/user/:userId', getChatsByUser);
router.get('/event/:eventId', getChatByEvent);

module.exports = router;
