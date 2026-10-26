const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const companyRoutes = require('./routes/companyRoutes');
const jobRoleRoutes = require('./routes/jobRoleRoutes');
const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const speechRoutes = require('./routes/speechRoutes');
const errorHandler = require('./middleware/errorHandler');
const sanitizeInput = require('./middleware/sanitizeInput');
const { apiLimiter } = require('./middleware/rateLimiters');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));
app.use(sanitizeInput);
app.use(apiLimiter);

app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    data: { status: 'Backend is running' },
    message: 'OK',
    error: null,
  });
});

app.use('/api/v1/companies', companyRoutes);
app.use('/api/v1/job-roles', jobRoleRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/resumes', resumeRoutes);
app.use('/api/v1/interviews', interviewRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/speech', speechRoutes);

app.use(errorHandler);

module.exports = app;