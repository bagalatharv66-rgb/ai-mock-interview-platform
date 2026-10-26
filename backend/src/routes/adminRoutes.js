const express = require('express');
const router = express.Router();
const { getPlatformStats } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.get('/stats', protect, adminOnly, getPlatformStats);

module.exports = router;