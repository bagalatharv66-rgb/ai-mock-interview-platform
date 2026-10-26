const { getScoringWeights } = require('./scoringConfig');

const calculateBehavioralScore = (behavioralIndicators) => {
  if (!behavioralIndicators) return null;
  if (typeof behavioralIndicators.confidenceIndicator === 'number') {
    return behavioralIndicators.confidenceIndicator;
  }
  // Older interviews, saved before the confidence indicator existed
  const { faceVisiblePercentage, eyeContactPercentage } = behavioralIndicators;
  if (faceVisiblePercentage == null || eyeContactPercentage == null) return null;
  return Math.round((faceVisiblePercentage + eyeContactPercentage) / 2);
};

const calculateQuestionOverallScore = ({ technicalScore, relevanceScore, communicationScore, behavioralScore }) => {
  const weights = getScoringWeights();

  const components = [
    { score: technicalScore, weight: weights.technical },
    { score: relevanceScore, weight: weights.relevance },
    { score: communicationScore, weight: weights.communication },
  ];

  if (behavioralScore !== null && behavioralScore !== undefined) {
    components.push({ score: behavioralScore, weight: weights.behavioral });
  }
  // No behavioral data? We simply re-normalize across the remaining weights below —
  // no penalty, no default-zero dragging the score down.

  const totalWeight = components.reduce((sum, c) => sum + c.weight, 0);
  const weightedSum = components.reduce((sum, c) => sum + c.score * c.weight, 0);

  return Math.round(weightedSum / totalWeight);
};

const calculateInterviewOverallScore = (questions) => {
  const scores = questions
    .map((q) => q.answer?.evaluation?.overallScore)
    .filter((s) => typeof s === 'number');
  if (scores.length === 0) return 0;
  const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  return Math.round(avg);
};

module.exports = { calculateBehavioralScore, calculateQuestionOverallScore, calculateInterviewOverallScore };