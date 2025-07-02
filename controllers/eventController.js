const Event = require('../models/Event');
const asyncHandler = require('express-async-handler');
const generateUniqueId = require('../utils/generateUniqueId');
const mongoose = require('mongoose');

exports.createEvent = asyncHandler(async (req, res) => {
    try {
        console.log(req.body)
        const event = new Event({
            ...req.body,
            date: new Date(req.body.date),
            participants: [],
            creatorId: req.body.creatorId,
            uniqueId: Math.floor(10000000 + Math.random() * 90000000),
        });

        await event.save();
        res.status(201).json(event);
    } catch (err) {
        console.error('❌ Error creating event:', err);

        res.status(500).json({ error: 'Помилка створення події' });
    }
});

exports.getEvents = asyncHandler(async (req, res) => {
    const events = await Event.find({ visibility: 'public' }).populate('creatorId', 'name photoUrl');

    res.json(events);
});
exports.join = asyncHandler(async (req, res) => {
    const eventId = req.params.id;
    const { userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return res.status(400).json({ error: 'Невалідний ID події' });
    }

    try {
        const event = await Event.findById(eventId);
        if (event.waitingFor !== 'all' && user.gender !== event.waitingFor) {
            return res.status(403).json({ error: 'Ця подія не доступна для вашої статі' });
        }

        if (!event) return res.status(404).json({ error: 'Подія не знайдена' });

        if (!event.participants.includes(userId)) {
            event.participants.push(userId);
            await event.save();
        }

        res.json({ success: true, participants: event.participants });
    } catch (err) {
        console.error('❌ Join error:', err);
        res.status(500).json({ error: 'Серверна помилка' });
    }

});
