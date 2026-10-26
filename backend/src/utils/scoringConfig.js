const getScoringWeights = () => {
  const weights = {
    technical: Number(process.env.SCORE_WEIGHT_TECHNICAL) || 35,
    relevance: Number(process.env.SCORE_WEIGHT_RELEVANCE) || 20,
    communication: Number(process.env.SCORE_WEIGHT_COMMUNICATION) || 20,
    behavioral: Number(process.env.SCORE_WEIGHT_BEHAVIORAL) || 25,
  };
  const total = Object.values(weights).reduce((sum, w) => sum + w, 0);
  // Normalize so they always sum to 100, even if someone edits .env to odd values later
  Object.keys(weights).forEach((key) => {
    weights[key] = (weights[key] / total) * 100;
  });
  return weights;
};

module.exports = { getScoringWeights };