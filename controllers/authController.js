const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

exports.register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) throw new Error('Користувач вже існує');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
});

exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new Error('Користувача не знайдено');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new Error('Невірний пароль');

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
});

exports.getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select('-passwordHash');
    res.json(user);
});
