require('dotenv').config();
const mongoose = require('mongoose');
const Company = require('./models/Company');
const JobRole = require('./models/JobRole');

const companies = [
  { name: 'Google', description: 'Technology company', tags: ['Tech'] },
  { name: 'Microsoft', description: 'Technology company', tags: ['Tech'] },
  { name: 'Amazon', description: 'E-commerce and cloud computing', tags: ['Tech', 'Cloud'] },
  { name: 'TCS', description: 'IT services and consulting', tags: ['Services'] },
  { name: 'Infosys', description: 'IT services and consulting', tags: ['Services'] },
  { name: 'Accenture', description: 'Consulting and technology services', tags: ['Services'] },
];

const roles = [
  { title: 'Backend Developer', skills: ['Node.js', 'MongoDB', 'REST API'] },
  { title: 'Frontend Developer', skills: ['React', 'JavaScript', 'CSS'] },
  { title: 'Full Stack Developer', skills: ['React', 'Node.js', 'MongoDB'] },
  { title: 'Data Analyst', skills: ['SQL', 'Python', 'Data Visualization'] },
  { title: 'Machine Learning Engineer', skills: ['Python', 'TensorFlow', 'Machine Learning'] },
  { title: 'DevOps Engineer', skills: ['Docker', 'Kubernetes', 'AWS'] },
  { title: 'QA Engineer', skills: ['Testing', 'Automation', 'Selenium'] },
  { title: 'Java Developer', skills: ['Java', 'SQL', 'Spring'] },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  for (const c of companies) {
    const exists = await Company.findOne({ name: c.name });
    if (!exists) await Company.create(c);
  }

  for (const r of roles) {
    const exists = await JobRole.findOne({ title: r.title });
    if (!exists) await JobRole.create({ title: r.title, requiredSkills: r.skills });
  }

  console.log('Seed complete');
  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});