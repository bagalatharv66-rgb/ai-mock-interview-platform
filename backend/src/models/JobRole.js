const mongoose = require('mongoose');

const jobRoleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    requiredSkills: [{ type: String }],
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('JobRole', jobRoleSchema);