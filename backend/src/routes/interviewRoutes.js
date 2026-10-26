const express = require('express');
const router = express.Router();
const {
  createInterview,
  getMyInterviews,
  getInterviewById,
  submitAnswer,
  getInterviewStats,
} = require('../controllers/interviewController');
const { createInterviewValidator, submitAnswerValidator } = require('../validators/interviewValidator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');
const { interviewCreationLimiter } = require('../middleware/rateLimiters');

router.post('/', protect, interviewCreationLimiter, createInterviewValidator, validate, createInterview);
router.get('/me', protect, getMyInterviews);
router.get('/stats', protect, getInterviewStats);
router.get('/:id', protect, getInterviewById);
router.patch('/:id/questions/:questionId/answer', protect, submitAnswerValidator, validate, submitAnswer);

module.exports = router;