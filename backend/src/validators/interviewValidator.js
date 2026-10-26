const { body } = require('express-validator');

const createInterviewValidator = [
  body('jobRole').isMongoId().withMessage('Valid jobRole ID is required'),
  body('company').optional().isMongoId().withMessage('Invalid company ID'),
  body('type').isIn(['HR', 'Technical', 'Mixed']).withMessage('Type must be HR, Technical, or Mixed'),
  body('difficulty').isIn(['Easy', 'Medium', 'Hard']).withMessage('Difficulty must be Easy, Medium, or Hard'),
  body('resumeId').optional().isMongoId().withMessage('Invalid resume ID'),
  body('questionCount')
    .optional()
    .isInt({ min: 3, max: 10 })
    .withMessage('Question count must be between 3 and 10')
    .toInt(),
];

const submitAnswerValidator = [
  body('transcript').trim().notEmpty().withMessage('Transcript cannot be empty'),
  body('frames').optional().isArray().withMessage('Frames must be an array'),
];

module.exports = { createInterviewValidator, submitAnswerValidator };