import { useEffect, useState } from 'react';
import api from '../services/api';

function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchResumes = async () => {
    const res = await api.get('/resumes/me');
    setResumes(res.data.data);
  };

  useEffect(() => {
    api.get('/resumes/me').then((res) => setResumes(res.data.data));
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please choose a PDF or DOCX file first');
      return;
    }
    setError('');
    setSuccess('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      await api.post('/resumes/upload', formData);
      setSuccess('Resume uploaded and analysed.');
      setFile(null);
      e.target.reset();
      await fetchResumes();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Your Resume</h1>
          <p className="text-sm text-gray-500 mb-4">
            Upload a PDF or DOCX (max 5MB). The text is stored in your account and sent to an AI
            service (Google Gemini) to tailor your interview questions. By uploading, you agree to
            this.
          </p>

          {error && <p className="text-red-600 mb-3 text-sm">{error}</p>}
          {success && <p className="text-green-600 mb-3 text-sm">{success}</p>}

          <form onSubmit={handleUpload} className="flex items-center gap-3">
            <input
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => setFile(e.target.files[0] || null)}
              className="text-sm"
            />
            <button
              type="submit"
              disabled={uploading}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="font-semibold text-gray-800 mb-4">Uploaded resumes</h2>
          {resumes.length === 0 ? (
            <p className="text-gray-500 text-sm">Nothing uploaded yet.</p>
          ) : (
            <div className="space-y-4">
              {resumes.map((r, idx) => (
                <div key={r._id} className="border border-gray-100 rounded p-4">
                  <p className="text-sm font-medium text-gray-800">
                    Uploaded {new Date(r.createdAt).toLocaleString()}
                    {idx === 0 && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        Latest
                      </span>
                    )}
                  </p>
                  {(!r.extractedText || r.extractedText.trim().length < 50) && (
                    <p className="text-amber-600 text-xs mt-1">
                      We couldn't read any text from this file (scanned/image-only PDFs aren't
                      supported), so it won't help tailor your questions.
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {r.extractedSkills.length > 0 ? (
                      r.extractedSkills.map((s) => (
                        <span key={s} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">
                        No known skill keywords detected
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResumeUpload;