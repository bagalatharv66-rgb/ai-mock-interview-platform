const express = require('express');
const router = express.Router();
const {
  createJobRole,
  getJobRoles,
  getJobRoleById,
  updateJobRole,
  deleteJobRole,
} = require('../controllers/jobRoleController');
const { createJobRoleValidator } = require('../validators/jobRoleValidator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.post('/', protect, adminOnly, createJobRoleValidator, validate, createJobRole);
router.get('/', getJobRoles);
router.get('/:id', getJobRoleById);
router.put('/:id', protect, adminOnly, updateJobRole);
router.delete('/:id', protect, adminOnly, deleteJobRole);

module.exports = router;