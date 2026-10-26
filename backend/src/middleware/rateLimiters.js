const rateLimit = require('express-rate-limit');

const makeLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    message: { success: false, data: null, message, error: null },
    standardHeaders: true,
    legacyHeaders: false,
  });

const apiLimiter = makeLimiter(
  15 * 60 * 1000,
  100,
  'Too many requests from this IP, please try again later.'
);

const authLimiter = makeLimiter(
  15 * 60 * 1000,
  10,
  'Too many authentication attempts, please try again later.'
);

const interviewCreationLimiter = makeLimiter(
  60 * 60 * 1000,
  10,
  'Too many interview creation requests, please try again later.'
);

const transcriptionLimiter = makeLimiter(
  60 * 60 * 1000,
  60,
  'Too many transcription requests, please try again later.'
);

module.exports = { apiLimiter, authLimiter, interviewCreationLimiter, transcriptionLimiter };