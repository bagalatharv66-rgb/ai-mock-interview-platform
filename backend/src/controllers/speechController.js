const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { transcribeAudio } = require('../services/transcriptionService');

const transcribe = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'No audio uploaded');
  }

  let transcript;
  try {
    transcript = await transcribeAudio({
      buffer: req.file.buffer,
      mimeType: req.file.mimetype,
    });
  } catch (err) {
    throw new ApiError(502, `Transcription failed: ${err.message}`);
  }

  res.status(200).json({
    success: true,
    data: { transcript },
    message: 'Audio transcribed',
    error: null,
  });
});

module.exports = { transcribe };