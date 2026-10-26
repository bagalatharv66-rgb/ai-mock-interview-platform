const Company = require('../models/Company');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const createCompany = asyncHandler(async (req, res) => {
  const company = await Company.create(req.body);
  res.status(201).json({ success: true, data: company, message: 'Company created', error: null });
});

const getCompanies = asyncHandler(async (req, res) => {
  const companies = await Company.find();
  res.status(200).json({ success: true, data: companies, message: 'Companies fetched', error: null });
});

const getCompanyById = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);
  if (!company) throw new ApiError(404, 'Company not found');
  res.status(200).json({ success: true, data: company, message: 'Company fetched', error: null });
});

const updateCompany = asyncHandler(async (req, res) => {
  const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!company) throw new ApiError(404, 'Company not found');
  res.status(200).json({ success: true, data: company, message: 'Company updated', error: null });
});

const deleteCompany = asyncHandler(async (req, res) => {
  const company = await Company.findByIdAndDelete(req.params.id);
  if (!company) throw new ApiError(404, 'Company not found');
  res.status(200).json({ success: true, data: null, message: 'Company deleted', error: null });
});

module.exports = { createCompany, getCompanies, getCompanyById, updateCompany, deleteCompany };