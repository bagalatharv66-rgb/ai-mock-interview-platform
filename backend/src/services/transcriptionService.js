const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const TRANSCRIPTION_PROMPT =
  'Transcribe the speech in this audio exactly as spoken, in English. ' +
  'Return only the transcript text: no commentary, no labels, no quotation marks. ' +
  'If there is no intelligible speech, return an empty string.';

const transcribeAudio = async ({ buffer, mimeType }) => {
  // Browsers send types like "audio/webm;codecs=opus" — Gemini wants just "audio/webm"
  const cleanMimeType = (mimeType || '').split(';')[0].trim();

  const response = await ai.models.generateContent({
    model:
      process.env.GEMINI_AUDIO_MODEL || process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
    contents: [
      { text: TRANSCRIPTION_PROMPT },
      { inlineData: { mimeType: cleanMimeType, data: buffer.toString('base64') } },
    ],
  });

  return (response.text || '').trim();
};

module.exports = { transcribeAudio };