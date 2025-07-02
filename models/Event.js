const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    uniqueId: { type: Number, required: true, unique: true },
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    location: {
        coordinates: { type: [Number], required: true },
        address: { type: String, required: true }
    },
    waitingFor: {
        type: String,
        enum: ['male', 'female', 'all'],
        default: 'all',
    },
    date: { type: Date, required: true },
    maxParticipants: { type: Number, default: 10 },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    visibility: { type: String, enum: ['public', 'private'], default: 'public' },
    inviteLink: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);
