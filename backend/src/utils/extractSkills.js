const KNOWN_SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'React', 'Node.js',
  'Express', 'MongoDB', 'SQL', 'MySQL', 'PostgreSQL', 'Django', 'Flask',
  'HTML', 'CSS', 'Tailwind', 'Git', 'Docker', 'Kubernetes', 'AWS', 'Azure',
  'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'OpenCV',
  'REST API', 'GraphQL', 'Redux', 'Next.js', 'Angular', 'Vue',
];

const extractSkills = (text) => {
  const lowerText = text.toLowerCase();
  return KNOWN_SKILLS.filter((skill) => lowerText.includes(skill.toLowerCase()));
};

module.exports = extractSkills;