const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['candidate', 'admin'], default: 'candidate' },
    profile: {
      skills: [{ type: String }],
      targetRoles: [{ type: String }],
      experienceLevel: {
        type: String,
        enum: ['fresher', 'junior', 'mid', 'senior'],
        default: 'fresher',
      },
      phone: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);