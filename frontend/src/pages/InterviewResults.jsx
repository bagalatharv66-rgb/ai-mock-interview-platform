import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

function ScoreBadge({ score }) {
  const color = score >= 75 ? 'bg-green-100 text-green-700'
    : score >= 50 ? 'bg-amber-100 text-amber-700'
    : 'bg-red-100 text-red-700';
  return <span className={`text-sm font-semibold px-2 py-1 rounded ${color}`}>{score}/100</span>;
}

const isNum = (v) => typeof v === 'number';

// "Camera data exists" = the camera produced numbers for this answer
const hasCameraData = (b) => b && isNum(b.faceVisiblePercentage);

const levelFor = (score) => (score >= 75 ? 'High' : score >= 50 ? 'Moderate' : 'Low');

const HEADLINES = {
  High: 'On camera, your delivery came across as composed and engaged.',
  Moderate: 'On camera, your delivery came across as fairly composed, with some room to improve.',
  Low: 'On camera, a few things could make your delivery look less settled to an interviewer.',
};

// Rule-based wording (plain if/else rules, not AI)
const buildFeedback = (b) => {
  const positives = [];
  const improvements = [];

  if (isNum(b.eyeContactPercentage)) {
    if (b.eyeContactPercentage >= 70) positives.push('You kept your face turned toward the camera while speaking.');
    else if (b.eyeContactPercentage < 50) improvements.push('Try to face the camera more while you speak — you often turned away.');
  }
  if (isNum(b.steadinessScore)) {
    if (b.steadinessScore >= 70) positives.push('You kept a steady, composed posture.');
    else if (b.steadinessScore < 40) improvements.push('You moved around quite a bit — settle into a steady seated position before you start.');
  }
  if (isNum(b.expressionRelaxedScore)) {
    if (b.expressionRelaxedScore >= 70) positives.push('Your facial expression looked relaxed.');
    else if (b.expressionRelaxedScore < 45) improvements.push('Your expression showed some tension at times (for example a furrowed brow or pressed lips) — a slow breath before answering can help.');
  }
  if (isNum(b.smilePercentage) && b.smilePercentage >= 15) {
    positives.push('You showed some warmth through occasional smiling.');
  }
  if (isNum(b.faceVisiblePercentage) && b.faceVisiblePercentage < 70) {
    improvements.push('Sit in a well-lit spot with your face centred in the frame — your face was often hard to detect.');
  }
  return { positives, improvements };
};

const summarizeCamera = (questions) => {
  const withData = questions.map((q) => q.answer?.behavioralIndicators).filter(hasCameraData);
  if (withData.length === 0) return null;

  const average = (key) => {
    const values = withData.map((b) => b[key]).filter(isNum);
    return values.length ? Math.round(values.reduce((s, v) => s + v, 0) / values.length) : null;
  };

  return {
    faceVisiblePercentage: average('faceVisiblePercentage'),
    eyeContactPercentage: average('eyeContactPercentage'),
    headMovementScore: average('headMovementScore'),
    steadinessScore: average('steadinessScore'),
    expressionRelaxedScore: average('expressionRelaxedScore'),
    smilePercentage: average('smilePercentage'),
    confidenceIndicator: average('confidenceIndicator'),
    answersWithData: withData.length,
  };
};

function DetailsPanel({ b }) {
  return (
    <details className="mt-2 text-xs text-gray-500">
      <summary className="cursor-pointer text-gray-600">How this was estimated</summary>
      <div className="mt-1 space-y-0.5">
        <p>Face visible: {b.faceVisiblePercentage}% of captured frames</p>
        {isNum(b.eyeContactPercentage) && <p>Head turned toward camera: {b.eyeContactPercentage}% of frames with a visible face</p>}
        {isNum(b.steadinessScore) && <p>Steadiness: {b.steadinessScore}/100 (raw head-movement score {b.headMovementScore})</p>}
        {isNum(b.expressionRelaxedScore) && <p>Relaxed expression: {b.expressionRelaxedScore}/100 (low brow, lip and mouth tension)</p>}
        {isNum(b.smilePercentage) && <p>Smiling: in {b.smilePercentage}% of frames (not part of the indicator)</p>}
        <p className="text-gray-400">
          The indicator is a weighted average of these signals. The weights and cut-offs are design
          choices, not scientifically validated values.
        </p>
      </div>
    </details>
  );
}

function CameraFeedback({ b, heading }) {
  if (!isNum(b.confidenceIndicator)) {
    return (
      <p className="text-sm text-gray-500">
        Not enough of your face was visible to estimate this, so it was left out of your score
        (nothing was deducted).
      </p>
    );
  }
  const level = levelFor(b.confidenceIndicator);
  const { positives, improvements } = buildFeedback(b);
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <p className="text-sm font-semibold text-gray-800">{heading}</p>
        <ScoreBadge score={b.confidenceIndicator} />
        <span className="text-xs text-gray-500">{level}</span>
      </div>
      <p className="text-sm text-gray-600">{HEADLINES[level]}</p>
      {positives.length > 0 && (
        <ul className="list-disc list-inside text-sm text-green-700 mt-2">
          {positives.map((p) => <li key={p}>{p}</li>)}
        </ul>
      )}
      {improvements.length > 0 && (
        <ul className="list-disc list-inside text-sm text-amber-700 mt-2">
          {improvements.map((p) => <li key={p}>{p}</li>)}
        </ul>
      )}
      <DetailsPanel b={b} />
    </div>
  );
}

function InterviewResults() {
  const { id } = useParams();
  const [interview, setInterview] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/interviews/${id}`)
      .then((res) => setInterview(res.data.data))
      .catch(() => setError('Could not load results'));
  }, [id]);

  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  if (!interview) return <div className="min-h-screen flex items-center justify-center">Loading results...</div>;

  const cameraSummary = summarizeCamera(interview.questions);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Interview Complete</h1>
          <p className="text-gray-500 mb-4">
            {interview.type} • {interview.difficulty} • {interview.questions.length} questions
          </p>
          <div className="text-5xl font-bold text-blue-600">
            {interview.overallScore}<span className="text-xl text-gray-400">/100</span>
          </div>
          <p className="text-gray-500 mt-1">Overall Score</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-1">On-camera confidence-related indicator (estimated)</h2>
          {cameraSummary ? (
            <>
              <p className="text-xs text-gray-400 mb-3">
                Based on {cameraSummary.answersWithData} of {interview.questions.length} answers with camera data.
              </p>
              <CameraFeedback b={cameraSummary} heading="Overall on-camera delivery" />
              <p className="text-xs text-gray-400 mt-3">
                This is an estimate based on visible behaviour: head position, posture and
                facial-expression signals. It cannot measure how confident you actually feel, and
                facial expressions do not reliably reveal inner feelings, so treat it as a rough
                practice aid. It carries less weight in your score than the content of your answers.
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500">
              No camera-based indicator is available for this interview, so your score is based on
              your answers only. Nothing was deducted for this.
            </p>
          )}
        </div>

        <div className="space-y-4">
          {interview.questions.map((q, idx) => (
            <div key={q._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800">Q{idx + 1}. {q.questionText}</h3>
                {q.answer?.evaluation && <ScoreBadge score={q.answer.evaluation.overallScore} />}
              </div>

              {q.answer?.evaluation ? (
                <>
                  <p className="text-gray-600 text-sm mt-2">{q.answer.evaluation.feedback}</p>

                  <div className="grid grid-cols-3 gap-2 mt-3 text-xs text-gray-500">
                    <span>Technical: {q.answer.evaluation.technicalScore}</span>
                    <span>Relevance: {q.answer.evaluation.relevanceScore}</span>
                    <span>Communication: {q.answer.evaluation.communicationScore}</span>
                  </div>

                  {q.answer.evaluation.strengths?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-green-700">Strengths</p>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        {q.answer.evaluation.strengths.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}

                  {q.answer.evaluation.suggestions?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-amber-700">Suggestions</p>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        {q.answer.evaluation.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-400 text-sm italic mt-2">Evaluation unavailable for this answer.</p>
              )}

              {hasCameraData(q.answer?.behavioralIndicators) && (
                <div className="mt-3 bg-gray-50 border border-gray-100 rounded p-3">
                  <CameraFeedback b={q.answer.behavioralIndicators} heading="On-camera delivery for this answer" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-6">
          <Link to="/dashboard" className="text-blue-600">Back to Dashboard</Link>
        </div>
      </div>
    </div>
  );
}

export default InterviewResults;