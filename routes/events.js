const express = require('express');
const router = express.Router();
const { createEvent, getEvents , join} = require('../controllers/eventController');

router.post('/', createEvent);
router.post('/:id/join', join);
router.get('/', getEvents);

module.exports = router;
