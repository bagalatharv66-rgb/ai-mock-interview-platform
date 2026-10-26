const axios = require('axios');

const CV_SERVICE_URL = process.env.CV_SERVICE_URL || 'http://localhost:8000';

const analyzeFrame = async (base64Image) => {
  try {
    const response = await axios.post(
      `${CV_SERVICE_URL}/analyze-frame`,
      { image: base64Image },
      { timeout: 5000 }
    );
    return response.data.data; // { faceDetected, noseX, noseY, horizontalOffsetRatio }
  } catch (error) {
    // If the CV service is unreachable or one frame fails, don't crash the whole
    // analysis — treat it as "no face detected for this frame" and move on.
    return { faceDetected: false, noseX: null, noseY: null, horizontalOffsetRatio: null };
  }
};

const analyzeFrames = async (base64Images) => {
  return Promise.all(base64Images.map((img) => analyzeFrame(img)));
};

module.exports = { analyzeFrames };