const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

router.get('/debug-events', async (req, res) => {
    try {
        const events = await Event.find({});
        res.json(events);
    } catch (err) {
        console.error('❌ Ошибка в debug-events:', err);
        res.status(500).json({ error: 'Ошибка получения событий' });
    }
});

module.exports = router;
