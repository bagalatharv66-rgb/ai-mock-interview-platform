const multer = require('multer');
const ApiError = require('../utils/ApiError');

const audioUpload = multer({
  storage: multer.memoryStorage(), // audio is never written to disk
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new ApiError(400, 'Only audio files are allowed'), false);
    }
  },
});

module.exports = audioUpload;