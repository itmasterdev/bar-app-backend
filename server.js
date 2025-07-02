const mongoose = require('mongoose');
const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const PORT = process.env.PORT || 5001;

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*', // або твій фронтенд-URL
        methods: ['GET', 'POST']
    }
});

app.set('io', io);

io.on('connection', (socket) => {
    console.log(`🟢 Користувач підключився: ${socket.id}`);

    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        console.log(`🔗 Socket ${socket.id} приєднався до кімнати ${roomId}`);
    });

    socket.on('sendMessage', (data) => {
        io.to(data.chatId).emit('receiveMessage', data);
    });

    socket.on('disconnect', () => {
        console.log(`🔴 Користувач відключився: ${socket.id}`);
    });
});

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('✅ Connected to MongoDB');

        await mongoose.connection.db.listCollections().toArray();

        server.listen(PORT, () => {
            console.log(`🔥 Socket-сервер запущено на порту ${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
    });
