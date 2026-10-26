const Interview = require('../models/Interview');
const JobRole = require('../models/JobRole');
const Resume = require('../models/Resume');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { generateInterviewQuestions, evaluateAnswer } = require('../services/geminiService');
const aggregateBehavioralIndicators = require('../utils/aggregateBehavioralIndicators');
const { analyzeFrames } = require('../services/cvServiceClient');
const {
  calculateBehavioralScore,
  calculateQuestionOverallScore,
  calculateInterviewOverallScore,
} = require('../utils/calculateScores');
const mongoose = require('mongoose');

const createInterview = asyncHandler(async (req, res) => {
  const { jobRole: jobRoleId, company, type, difficulty, resumeId, questionCount } = req.body;

  const jobRole = await JobRole.findById(jobRoleId).populate('company');
  if (!jobRole) {
    throw new ApiError(404, 'Job role not found');
  }

  let candidateSkills = [];
  let resumeText = '';
  if (resumeId) {
    const resume = await Resume.findOne({ _id: resumeId, user: req.user.id });
    if (resume) {
      candidateSkills = resume.extractedSkills;
      resumeText = resume.extractedText || '';
    }
  }

  let questions;
  try {
    questions = await generateInterviewQuestions({
      jobTitle: jobRole.title,
      companyName: jobRole.company?.name,
      requiredSkills: jobRole.requiredSkills,
      candidateSkills,
      resumeText,
      type,
      difficulty,
      questionCount,
    });
  } catch (err) {
    throw new ApiError(502, `AI question generation failed: ${err.message}`);
  }

  const interview = await Interview.create({
    user: req.user.id,
    jobRole: jobRoleId,
    company: company || jobRole.company?._id,
    type,
    difficulty,
    questions,
  });

  res.status(201).json({
    success: true,
    data: interview,
    message: 'Interview created with AI-generated questions',
    error: null,
  });
});

const getMyInterviews = asyncHandler(async (req, res) => {
  const interviews = await Interview.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: interviews, message: 'Interviews fetched', error: null });
});

const getInterviewById = asyncHandler(async (req, res) => {
  const interview = await Interview.findOne({ _id: req.params.id, user: req.user.id })
    .populate('jobRole')
    .populate('company');
  if (!interview) {
    throw new ApiError(404, 'Interview not found');
  }
  res.status(200).json({ success: true, data: interview, message: 'Interview fetched', error: null });
});

const submitAnswer = asyncHandler(async (req, res) => {
  const { id, questionId } = req.params;
  const { transcript, frames } = req.body;

  const interview = await Interview.findOne({ _id: id, user: req.user.id });
  if (!interview) {
    throw new ApiError(404, 'Interview not found');
  }

  const question = interview.questions.id(questionId);
  if (!question) {
    throw new ApiError(404, 'Question not found in this interview');
  }

  question.answer = question.answer || {};
  question.answer.transcript = transcript;

  const hasFrames = Array.isArray(frames) && frames.length > 0;

  const [behavioralIndicators, evaluation] = await Promise.all([
    hasFrames
      ? analyzeFrames(frames).then(aggregateBehavioralIndicators)
      : Promise.resolve(null),
    evaluateAnswer({
      questionText: question.questionText,
      category: question.category,
      transcript,
    }).catch(() => null),
  ]);

  if (behavioralIndicators) {
    question.answer.behavioralIndicators = behavioralIndicators;
  }

  const behavioralScore = calculateBehavioralScore(behavioralIndicators);

  if (evaluation) {
    const overallScore = calculateQuestionOverallScore({
      technicalScore: evaluation.technicalScore,
      relevanceScore: evaluation.relevanceScore,
      communicationScore: evaluation.communicationScore,
      behavioralScore,
    });

    question.answer.evaluation = {
      ...evaluation,
      behavioralScore: behavioralScore !== null ? behavioralScore : 0,
      overallScore,
    };
  }

  const allAnswered = interview.questions.every((q) => q.answer?.transcript?.trim());
  if (allAnswered) {
    interview.status = 'completed';
    interview.completedAt = new Date();
    interview.overallScore = calculateInterviewOverallScore(interview.questions);
  }

  await interview.save();

  res.status(200).json({ success: true, data: interview, message: 'Answer saved', error: null });
});

const getInterviewStats = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user.id);

  // Aggregation pipeline: summary stats computed inside MongoDB itself
  const summaryResult = await Interview.aggregate([
    { $match: { user: userId, status: 'completed' } },
    {
      $group: {
        _id: null,
        totalInterviews: { $sum: 1 },
        averageScore: { $avg: '$overallScore' },
        bestScore: { $max: '$overallScore' },
      },
    },
  ]);

  const summary = summaryResult[0] || { totalInterviews: 0, averageScore: 0, bestScore: 0 };
  summary.averageScore = Math.round(summary.averageScore || 0);

  // Breakdown by interview type — another $group, grouping by a field instead of null
  const byTypeResult = await Interview.aggregate([
    { $match: { user: userId, status: 'completed' } },
    { $group: { _id: '$type', averageScore: { $avg: '$overallScore' } } },
  ]);
  const averageByType = {};
  byTypeResult.forEach((row) => {
    averageByType[row._id] = Math.round(row.averageScore);
  });

  // Trend: we need every individual data point, not a summary — so a plain
  // sorted query is the right tool here, not $group
  const trend = await Interview.find({ user: req.user.id, status: 'completed' })
    .sort({ completedAt: 1 })
    .select('overallScore completedAt -_id');

  res.status(200).json({
    success: true,
    data: {
      totalInterviews: summary.totalInterviews,
      averageScore: summary.averageScore,
      bestScore: summary.bestScore || 0,
      averageByType,
      trend: trend.map((t) => ({ score: t.overallScore, date: t.completedAt })),
    },
    message: 'Stats fetched',
    error: null,
  });
});

module.exports = {
  createInterview,
  getMyInterviews,
  getInterviewById,
  submitAnswer,
  getInterviewStats,
};