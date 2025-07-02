const Chat = require('../models/Chat');
const Message = require('../models/Message');
const mongoose = require('mongoose');

exports.createChat = async (req, res) => {
    try {
        const { eventId, ownerId } = req.body;
        const existing = await Chat.findOne({ eventId });
        if (existing) return res.status(200).json(existing);

        const chat = await Chat.create({ eventId, ownerId });

        res.status(201).json(chat);
    } catch (err) {
        console.error('❌ Failed to create chat:', err);
        res.status(500).json({ error: 'Failed to create chat' });
    }
};

exports.getChatsByUser = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.params.userId);

        const chats = await Chat.find()
            .populate('lastMessage')
            .populate({
                path: 'eventId',
                match: { participants: userId },
                populate: {
                    path: 'participants',
                    select: 'name email photoUrl',
                },
            })
            .sort({ updatedAt: -1 });

        // Відкидаємо чати без події або де юзер не є учасником
        const filteredChats = chats.filter(chat => chat.eventId);

        // Для кожного чату — рахуємо кількість непрочитаних повідомлень
        const chatsWithUnread = await Promise.all(
            filteredChats.map(async (chat) => {
                const unreadCount = await Message.countDocuments({
                    chatId: chat._id,
                    readBy: { $ne: userId },
                    senderId: { $ne: userId }, // не рахувати свої повідомлення
                });

                // додаємо поле до обʼєкта
                return {
                    ...chat.toObject(),
                    unreadCount,
                };
            })
        );

        res.json(chatsWithUnread);
    } catch (err) {
        console.error('❌ Failed to fetch chats:', err);
        res.status(500).json({ error: 'Failed to fetch chats' });
    }
};



exports.joinChat = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { userId } = req.body;

        const chat = await Chat.findById(chatId).populate('eventId');
        if (!chat || !chat.eventId) {
            return res.status(404).json({ error: 'Chat або повʼязана подія не знайдені' });
        }

        const event = chat.eventId;

        if (!event.participants.includes(userId)) {
            event.participants.push(userId);
            await event.save();
        }

        res.status(200).json(chat);
    } catch (err) {
        console.error('❌ Failed to join chat:', err);
        res.status(500).json({ error: 'Failed to join chat' });
    }
};

exports.getChatByEvent = async (req, res) => {
    try {
        const chat= await Chat.findOne({ eventId: req.params.eventId });
        if (!chat) {
            res.status(404).json({ error: 'Chat not found' });
        }
        res.json(chat);
    } catch (err) {
        res.status(500).json({ error: 'Failed to get chat' });
    }
};
