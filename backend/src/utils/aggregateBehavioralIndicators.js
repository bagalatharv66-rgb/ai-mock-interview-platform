// ---- Heuristic settings: design choices, NOT research-derived values. ----
// Tune these after trying the calibration test at the end of this message.
const CENTERED_MIN = 0.35;          // nose position band treated as "facing the camera"
const CENTERED_MAX = 0.65;
const SMILE_THRESHOLD = 0.3;        // blendshape score above which a frame counts as "smiling"
const TENSION_MAX = 0.4;            // average tension at/above this = 0 on the "relaxed" scale
const MOVEMENT_STEADY = 20;         // headMovementScore at/below this = fully steady
const MOVEMENT_RESTLESS = 100;      // headMovementScore at/above this = not steady at all
const MIN_VISIBLE_FOR_INDICATOR = 30; // below this % visible, we don't estimate at all

const INDICATOR_WEIGHTS = {
  facing: 0.3,
  visible: 0.2,
  steadiness: 0.25,
  relaxed: 0.25,
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const mean = (values) => values.reduce((sum, v) => sum + v, 0) / values.length;

const aggregateBehavioralIndicators = (frameResults) => {
  const total = frameResults.length;
  const empty = {
    eyeContactPercentage: null,
    headMovementScore: null,
    faceVisiblePercentage: null,
    steadinessScore: null,
    expressionRelaxedScore: null,
    smilePercentage: null,
    confidenceIndicator: null,
  };
  if (total === 0) return empty;

  const detectedFrames = frameResults.filter((f) => f.faceDetected);
  const faceVisiblePercentage = Math.round((detectedFrames.length / total) * 100);

  let eyeContactPercentage = null;
  if (detectedFrames.length > 0) {
    const centered = detectedFrames.filter(
      (f) => f.horizontalOffsetRatio >= CENTERED_MIN && f.horizontalOffsetRatio <= CENTERED_MAX
    );
    eyeContactPercentage = Math.round((centered.length / detectedFrames.length) * 100);
  }

  let headMovementScore = null;
  let steadinessScore = null;
  if (detectedFrames.length >= 2) {
    let totalMovement = 0;
    for (let i = 1; i < detectedFrames.length; i++) {
      const dx = detectedFrames[i].noseX - detectedFrames[i - 1].noseX;
      const dy = detectedFrames[i].noseY - detectedFrames[i - 1].noseY;
      totalMovement += Math.sqrt(dx * dx + dy * dy);
    }
    const avgMovement = totalMovement / (detectedFrames.length - 1);
    headMovementScore = Math.min(100, Math.round(avgMovement * 1000));
    steadinessScore = Math.round(
      clamp(((MOVEMENT_RESTLESS - headMovementScore) / (MOVEMENT_RESTLESS - MOVEMENT_STEADY)) * 100, 0, 100)
    );
  }

  let smilePercentage = null;
  let expressionRelaxedScore = null;
  const withExpression = detectedFrames.filter((f) => f.expression);
  if (withExpression.length > 0) {
    const smiling = withExpression.filter((f) => f.expression.smile >= SMILE_THRESHOLD);
    smilePercentage = Math.round((smiling.length / withExpression.length) * 100);
    const avgTension = mean(withExpression.map((f) => f.expression.tension));
    expressionRelaxedScore = Math.round(clamp((1 - avgTension / TENSION_MAX) * 100, 0, 100));
  }

  // Confidence-related indicator: weighted average of whichever components exist.
  // Too little of the face visible -> we don't estimate at all (and nobody is penalised).
  let confidenceIndicator = null;
  if (faceVisiblePercentage >= MIN_VISIBLE_FOR_INDICATOR) {
    const components = [
      { score: eyeContactPercentage, weight: INDICATOR_WEIGHTS.facing },
      { score: faceVisiblePercentage, weight: INDICATOR_WEIGHTS.visible },
      { score: steadinessScore, weight: INDICATOR_WEIGHTS.steadiness },
      { score: expressionRelaxedScore, weight: INDICATOR_WEIGHTS.relaxed },
    ].filter((c) => typeof c.score === 'number');

    if (components.length > 0) {
      const totalWeight = components.reduce((sum, c) => sum + c.weight, 0);
      const weighted = components.reduce((sum, c) => sum + c.score * c.weight, 0);
      confidenceIndicator = Math.round(weighted / totalWeight);
    }
  }

  return {
    eyeContactPercentage,
    headMovementScore,
    faceVisiblePercentage,
    steadinessScore,
    expressionRelaxedScore,
    smilePercentage,
    confidenceIndicator,
  };
};

module.exports = aggregateBehavioralIndicators;