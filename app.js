const path = require('path');
const express = require('express');
const cors = require('cors');

const eventRoutes = require('./routes/events');
const debugRoutes = require('./routes/debug');
const chatRoutes = require('./routes/chat');
const messageRoutes = require('./routes/message');
const userRoutes = require('./routes/users');

const app = express();

// Middleware для обработки JSON и CORS
app.use(express.json());
app.use(cors());

app.use('/api/events', eventRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

module.exports = app;
