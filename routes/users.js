const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getMe,
    updateProfile,
    uploadMiddleware,
    uploadPhoto,
    sendVerificationCode,
    verifyEmailCode
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.put('/photo', protect, uploadMiddleware, uploadPhoto);
router.post('/send-code', sendVerificationCode);
router.post('/verify-code', verifyEmailCode);

module.exports = router;
