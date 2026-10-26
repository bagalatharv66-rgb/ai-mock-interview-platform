const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fileUrl: { type: String, required: true },
    extractedText: { type: String },
    extractedSkills: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', resumeSchema);