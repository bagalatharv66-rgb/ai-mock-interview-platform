const User = require('../models/User');
const Interview = require('../models/Interview');
const asyncHandler = require('../utils/asyncHandler');

const getPlatformStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments({ role: 'candidate' });
  const totalInterviews = await Interview.countDocuments();
  const completedInterviews = await Interview.countDocuments({ status: 'completed' });

  const scoreAgg = await Interview.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, averageScore: { $avg: '$overallScore' } } },
  ]);
  const platformAverageScore = Math.round(scoreAgg[0]?.averageScore || 0);

  const interviewsByType = await Interview.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: '$type', count: { $sum: 1 } } },
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalInterviews,
      completedInterviews,
      platformAverageScore,
      interviewsByType: interviewsByType.map((r) => ({ type: r._id, count: r.count })),
    },
    message: 'Platform stats fetched',
    error: null,
  });
});

module.exports = { getPlatformStats };