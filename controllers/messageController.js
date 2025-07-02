const Message = require('../models/Message');
const Chat = require('../models/Chat');
const asyncHandler = require('express-async-handler');

exports.sendMessage = asyncHandler(async (req, res) => {
    const { chatId, senderId, text } = req.body;

    if (!chatId || !senderId || !text) {
        res.status(400);
        throw new Error('Усі поля обовʼязкові');
    }

    const newMessage = await Message.create({
        chatId,
        senderId,
        text,
        readBy: [senderId],
    });

    await Chat.findByIdAndUpdate(chatId, {
        lastMessage: newMessage._id,
        updatedAt: new Date(),
    });

    const io = req.app.get('io');
    io.to(chatId).emit('receiveMessage', newMessage);

    res.status(201).json(newMessage);
});

exports.getMessagesByChat = asyncHandler(async (req, res) => {
    const { chatId } = req.params;

    const messages = await Message.find({ chatId })
        .populate('senderId', 'name photoUrl')
        .sort({ timestamp: 1 });
    res.json(messages);
});

exports.markMessagesAsRead = asyncHandler( async(req, res) => {
    const { chatId, userId } = req.body;

    try {
        await Message.updateMany(
            {
                chatId,
                readBy: { $ne: userId } // тільки ті, які ще не прочитані цим юзером
            },
            { $addToSet: { readBy: userId } } // додаємо userId
        );

        res.status(200).json({ success: true });
    } catch (err) {
        console.error('❌ Error updating messages:', err);
        res.status(500).json({ error: 'Failed to update read status' });
    }

});