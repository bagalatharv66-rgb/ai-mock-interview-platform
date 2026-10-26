const { body } = require('express-validator');

const createCompanyValidator = [
  body('name').trim().notEmpty().withMessage('Company name is required'),
  body('description').optional().isString(),
  body('tags').optional().isArray(),
];

module.exports = { createCompanyValidator };