const express = require('express');
const router = express.Router();
const { transcribe } = require('../controllers/speechController');
const { protect } = require('../middleware/authMiddleware');
const { transcriptionLimiter } = require('../middleware/rateLimiters');
const audioUpload = require('../middleware/audioUpload');

router.post('/transcribe', protect, transcriptionLimiter, audioUpload.single('audio'), transcribe);

module.exports = router;