import { useState, useRef, useCallback, useEffect } from 'react';
import api from '../services/api';

const MAX_RECORDING_MS = 120000; // auto-stop after 2 minutes

const stopTracks = (stream) => stream?.getTracks().forEach((track) => track.stop());

function useAudioRecorder({ onTranscript } = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState('');

  const isSupported =
    typeof window !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof window.MediaRecorder !== 'undefined';

  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timeoutRef = useRef(null);
  const onTranscriptRef = useRef(onTranscript);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  const uploadAudio = useCallback(async (blob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'answer-audio');
      const res = await api.post('/speech/transcribe', formData);
      onTranscriptRef.current?.(res.data.data.transcript);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Transcription failed — please type your answer instead.'
      );
    } finally {
      setIsTranscribing(false);
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (!isSupported) return;
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        clearTimeout(timeoutRef.current);
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        stopTracks(streamRef.current);
        streamRef.current = null;
        setIsRecording(false);
        if (blob.size > 0) uploadAudio(blob);
      };

      recorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);

      timeoutRef.current = setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop();
      }, MAX_RECORDING_MS);
    } catch (err) {
      stopTracks(streamRef.current);
      streamRef.current = null;
      setIsRecording(false);
      setError(
        err.name === 'NotAllowedError'
          ? 'Microphone access was denied — allow it in your browser, or type your answer.'
          : 'Could not start recording — please type your answer instead.'
      );
    }
  }, [isSupported, uploadAudio]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      recorderRef.current.stop();
    }
  }, []);

  // If the user leaves the page mid-recording, shut the microphone off cleanly
  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
      if (recorderRef.current) {
        recorderRef.current.onstop = null;
        if (recorderRef.current.state === 'recording') recorderRef.current.stop();
      }
      stopTracks(streamRef.current);
    };
  }, []);

  return { isRecording, isTranscribing, isSupported, error, startRecording, stopRecording };
}

export default useAudioRecorder;