import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAudioRecorder from '../hooks/useAudioRecorder';
import useWebcam from '../hooks/useWebcam';

const FRAME_CAPTURE_INTERVAL_MS = 2000;
const MAX_FRAMES_PER_QUESTION = 30;

function InterviewRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [frameCount, setFrameCount] = useState(0);
  const capturedFramesRef = useRef([]);

  const handleTranscript = (text) => {
    if (!text) {
      setNotice("We couldn't hear any speech — please try again, or type your answer.");
      return;
    }
    setNotice('');
    setAnswerText((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text));
  };

  const {
    isRecording,
    isTranscribing,
    isSupported,
    error: audioError,
    startRecording,
    stopRecording,
  } = useAudioRecorder({ onTranscript: handleTranscript });

  const {
    videoRef,
    canvasRef,
    isActive: cameraActive,
    error: cameraError,
    startCamera,
    stopCamera,
    captureFrame,
  } = useWebcam();

  useEffect(() => {
    api.get(`/interviews/${id}`)
      .then((res) => setInterview(res.data.data))
      .catch(() => setError('Could not load interview'));
  }, [id]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!cameraActive) return;
    const intervalId = setInterval(() => {
      if (capturedFramesRef.current.length >= MAX_FRAMES_PER_QUESTION) return;
      const frame = captureFrame();
      if (frame) {
        capturedFramesRef.current.push(frame);
        setFrameCount(capturedFramesRef.current.length);
      }
    }, FRAME_CAPTURE_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [cameraActive, captureFrame, currentIndex]);

  if (error && !interview) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  }
  if (!interview) {
    return <div className="min-h-screen flex items-center justify-center">Loading interview...</div>;
  }

  const questions = interview.questions;
  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const resetFrameCapture = () => {
    capturedFramesRef.current = [];
    setFrameCount(0);
  };

  const handleNext = async () => {
    if (isRecording || isTranscribing) return;
    if (!answerText.trim()) {
      setError('Please record or type an answer before continuing');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await api.patch(`/interviews/${id}/questions/${currentQuestion._id}/answer`, {
        transcript: answerText,
        frames: capturedFramesRef.current,
      });
      if (isLastQuestion) {
        stopCamera();
        navigate(`/interview/${id}/results`);
      } else {
        setCurrentIndex((prev) => prev + 1);
        setAnswerText('');
        setNotice('');
        resetFrameCapture();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save your answer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-sm font-medium text-gray-500">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              {currentQuestion.category}
            </span>
          </div>

          <div className="text-right">
            <video ref={videoRef} autoPlay muted playsInline
              className="w-32 h-24 bg-gray-900 rounded object-cover" />
            <p className="text-xs mt-1">
              {cameraActive ? (
                <span className="text-green-600">🟢 {frameCount} frames captured</span>
              ) : cameraError ? (
                <span className="text-amber-600">⚠️ No camera</span>
              ) : (
                <span className="text-gray-400">Starting camera...</span>
              )}
            </p>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-6">{currentQuestion.questionText}</h2>

        {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}
        {cameraError && (
          <p className="text-amber-600 text-sm mb-3">
            {cameraError} (The interview continues normally without video analysis.)
          </p>
        )}
        {!isSupported && (
          <p className="text-amber-600 text-sm mb-3">
            Audio recording isn't supported in this browser — please type your answer below.
          </p>
        )}
        {audioError && <p className="text-amber-600 text-sm mb-3">{audioError}</p>}
        {notice && <p className="text-amber-600 text-sm mb-3">{notice}</p>}

        <div className="flex items-center gap-3 mb-4">
          <button type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={!isSupported || isTranscribing}
            className={`px-4 py-2 rounded font-medium disabled:opacity-40 ${
              isRecording ? 'bg-red-600 text-white' : 'bg-gray-800 text-white'
            }`}>
            {isRecording ? '⏹ Stop & Transcribe' : '🎤 Start Recording'}
          </button>
          {isRecording && (
            <span className="text-sm text-red-600 flex items-center gap-1">
              <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" /> Recording...
            </span>
          )}
          {isTranscribing && <span className="text-sm text-blue-600">Transcribing...</span>}
        </div>
        <p className="text-xs text-gray-400 mb-2">
          Your answer is transcribed after you stop recording. You can edit the text before continuing.
        </p>

        <textarea
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          rows={6}
          placeholder="Record your answer, or type it directly"
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
        />

        <button onClick={handleNext}
          disabled={submitting || isRecording || isTranscribing}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">
          {submitting ? 'Saving...' : isLastQuestion ? 'Finish Interview' : 'Next Question'}
        </button>
      </div>
    </div>
  );
}

export default InterviewRoom;