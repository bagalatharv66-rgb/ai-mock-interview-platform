import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function InterviewSetup() {
  const [companies, setCompanies] = useState([]);
  const [jobRoles, setJobRoles] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [company, setCompany] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [resumeId, setResumeId] = useState('');
  const [type, setType] = useState('Technical');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/companies').then((res) => setCompanies(res.data.data));
    api.get('/job-roles').then((res) => setJobRoles(res.data.data));
    api.get('/resumes/me').then((res) => {
      const list = res.data.data;
      setResumes(list);
      if (list.length > 0) setResumeId(list[0]._id); // newest first
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jobRole) {
      setError('Please select a job role');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/interviews', {
        jobRole,
        company: company || undefined,
        resumeId: resumeId || undefined,
        type,
        difficulty,
        questionCount,
      });
      navigate(`/interview/${res.data.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start interview');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Set Up Your Interview</h1>
        {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company (optional)</label>
            <select value={company} onChange={(e) => setCompany(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2">
              <option value="">— None —</option>
              {companies.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Role</label>
            <select value={jobRole} onChange={(e) => setJobRole(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2" required>
              <option value="">— Select a role —</option>
              {jobRoles.map((r) => (
                <option key={r._id} value={r._id}>{r.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resume (optional)</label>
            {resumes.length > 0 ? (
              <select value={resumeId} onChange={(e) => setResumeId(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2">
                <option value="">— Don't use a resume —</option>
                {resumes.map((r) => (
                  <option key={r._id} value={r._id}>
                    Uploaded {new Date(r.createdAt).toLocaleDateString()} — {r.extractedSkills.length} skills detected
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-gray-500">
                No resume uploaded yet.{' '}
                <Link to="/resume" className="text-blue-600">Upload one</Link> to get questions
                tailored to your experience.
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interview Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2">
              <option value="HR">HR</option>
              <option value="Technical">Technical</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2">
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of questions</label>
            <select value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full border border-gray-300 rounded px-3 py-2">
              {[3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>{n} questions</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              More questions take longer to generate and to score.
            </p>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Generating questions...' : 'Start Interview'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default InterviewSetup;