const Resume = require('../models/Resume');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const extractTextFromFile = require('../utils/extractResumeText');
const extractSkills = require('../utils/extractSkills');

const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'No file uploaded');
  }

  const extractedText = await extractTextFromFile(req.file.path, req.file.mimetype);
  const extractedSkills = extractSkills(extractedText);

  const resume = await Resume.create({
    user: req.user.id,
    fileUrl: `/uploads/resumes/${req.file.filename}`,
    extractedText,
    extractedSkills,
  });

  res.status(201).json({
    success: true,
    data: resume,
    message: 'Resume uploaded and processed',
    error: null,
  });
});

const getMyResumes = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: resumes, message: 'Resumes fetched', error: null });
});

module.exports = { uploadResume, getMyResumes };