const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const { sendVerificationEmail } = require('../utils/sendVerificationEmail');


// Налаштування збереження
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // важливо — ця папка має існувати
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});
const upload = multer({ storage });

// Генерація JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};
exports.uploadMiddleware = upload.single('photo');
exports.uploadPhoto = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('Фото не завантажене');
    }

    const photoUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    req.user.photoUrl = photoUrl;
    await req.user.save();
    res.json({ photoUrl });
});

// @route POST /api/users/register
exports.register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
        res.status(400);
        throw new Error('Користувач з такою поштою вже існує');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.create({
        name,
        email,
        passwordHash,
        emailVerificationCode: code,
        emailVerificationExpires: Date.now() + 15 * 60 * 1000, // 15 хв
        isVerified: false,
    });

    // відправити email (наприклад, через nodemailer)
    await sendVerificationEmail(user.email, code);

    res.status(201).json({
        message: 'Код підтвердження надіслано на email',
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            isVerified: user.isVerified,
        }
    });
});

// @route POST /api/users/login
exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        res.status(401);
        throw new Error('Невірна пошта або пароль');
    }

    res.json({
        user,
        token: generateToken(user._id),
    });
});

exports.getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    res.json(user);
});

exports.updateProfile = asyncHandler(async (req, res) => {
    const { name, description, photoUrl, gender } = req.body;
    const user= await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('Користувача не знайдено');
    }

    if (name !== undefined) user.name = name;
    if (description !== undefined) user.description = description;
    if (photoUrl !== undefined) user.photoUrl = photoUrl;
    if (gender !== undefined) user.gender = gender;

    const updatedUser = await user.save();

    res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        description: updatedUser.description,
        gender: updatedUser.gender,
        photoUrl: updatedUser.photoUrl,
    });
});

exports.sendVerificationCode = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Користувача не знайдено' });

    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-значний код
    user.emailVerificationCode = code;
    user.emailVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 хв

    await user.save();

    // Надсилання email
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        to: email,
        subject: 'Код підтвердження',
        text: `Ваш код підтвердження: ${code}`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Код підтвердження надіслано' });
});
exports.verifyEmailCode = asyncHandler(async (req, res) => {
    const { email, code } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        res.status(404);
        throw new Error('Користувача не знайдено');
    }

    if (user.isVerified) {
        return res.status(200).json({ message: 'Email вже підтверджено' });
    }

    if (
        user.emailVerificationCode !== code ||
        !user.emailVerificationExpires ||
        user.emailVerificationExpires < Date.now()
    ) {
        res.status(400);
        throw new Error('Недійсний або протермінований код');
    }

    user.isVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({
        message: 'Email підтверджено успішно',
        token: generateToken(user._id), // логіним одразу після верифікації
        user,
    });
});