const express = require('express');
const router = express.Router();
const {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
} = require('../controllers/companyController');
const { createCompanyValidator } = require('../validators/companyValidator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.post('/', protect, adminOnly, createCompanyValidator, validate, createCompany);
router.get('/', getCompanies);
router.get('/:id', getCompanyById);
router.put('/:id', protect, adminOnly, updateCompany);
router.delete('/:id', protect, adminOnly, deleteCompany);

module.exports = router;