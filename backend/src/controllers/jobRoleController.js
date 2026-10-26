const JobRole = require('../models/JobRole');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const createJobRole = asyncHandler(async (req, res) => {
  const jobRole = await JobRole.create(req.body);
  res.status(201).json({ success: true, data: jobRole, message: 'Job role created', error: null });
});

const getJobRoles = asyncHandler(async (req, res) => {
  const jobRoles = await JobRole.find().populate('company');
  res.status(200).json({ success: true, data: jobRoles, message: 'Job roles fetched', error: null });
});

const getJobRoleById = asyncHandler(async (req, res) => {
  const jobRole = await JobRole.findById(req.params.id).populate('company');
  if (!jobRole) throw new ApiError(404, 'Job role not found');
  res.status(200).json({ success: true, data: jobRole, message: 'Job role fetched', error: null });
});

const updateJobRole = asyncHandler(async (req, res) => {
  const jobRole = await JobRole.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!jobRole) throw new ApiError(404, 'Job role not found');
  res.status(200).json({ success: true, data: jobRole, message: 'Job role updated', error: null });
});

const deleteJobRole = asyncHandler(async (req, res) => {
  const jobRole = await JobRole.findByIdAndDelete(req.params.id);
  if (!jobRole) throw new ApiError(404, 'Job role not found');
  res.status(200).json({ success: true, data: null, message: 'Job role deleted', error: null });
});

module.exports = { createJobRole, getJobRoles, getJobRoleById, updateJobRole, deleteJobRole };