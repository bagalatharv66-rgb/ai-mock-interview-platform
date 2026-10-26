const express = require('express');
const router = express.Router();
const { uploadResume, getMyResumes } = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.post('/upload', protect, upload.single('resume'), uploadResume);
router.get('/me', protect, getMyResumes);

module.exports = router;