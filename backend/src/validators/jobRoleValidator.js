const { body } = require('express-validator');

const createJobRoleValidator = [
  body('title').trim().notEmpty().withMessage('Job role title is required'),
  body('requiredSkills').optional().isArray(),
  body('company').optional().isMongoId().withMessage('Invalid company ID'),
];

module.exports = { createJobRoleValidator };