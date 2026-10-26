const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema(
  {
    technicalScore: { type: Number, default: 0 },
    relevanceScore: { type: Number, default: 0 },
    communicationScore: { type: Number, default: 0 },
    behavioralScore: { type: Number, default: 0 },
    overallScore: { type: Number, default: 0 },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    suggestions: [{ type: String }],
    feedback: { type: String },
  },
  { _id: false }
);

const answerSchema = new mongoose.Schema(
  {
    transcript: { type: String, default: '' },
    behavioralIndicators: {
      eyeContactPercentage: { type: Number },
      headMovementScore: { type: Number },
      faceVisiblePercentage: { type: Number },
      steadinessScore: { type: Number },
      expressionRelaxedScore: { type: Number },
      smilePercentage: { type: Number },
      confidenceIndicator: { type: Number },
    },
    evaluation: evaluationSchema,
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  category: { type: String },
  order: { type: Number },
  answer: answerSchema,
});

const interviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    jobRole: { type: mongoose.Schema.Types.ObjectId, ref: 'JobRole' },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    type: { type: String, enum: ['HR', 'Technical', 'Mixed'], required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    status: { type: String, enum: ['in-progress', 'completed'], default: 'in-progress' },
    questions: [questionSchema],
    overallScore: { type: Number, default: 0 },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Interview', interviewSchema);