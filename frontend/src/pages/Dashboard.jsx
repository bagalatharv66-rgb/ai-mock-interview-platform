import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-5 text-center">
      <p className="text-3xl font-bold text-blue-600">{value}</p>
      <p className="text-gray-500 text-sm mt-1">{label}</p>
    </div>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/interviews/stats'), api.get('/interviews/me')])
      .then(([statsRes, interviewsRes]) => {
        setStats(statsRes.data.data);
        setInterviews(interviewsRes.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const chartData = (stats?.trend || []).map((t, idx) => ({ name: `#${idx + 1}`, score: t.score }));

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.name}</h1>
          <Link to="/interview-setup" className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700">
            Start New Interview
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading your stats...</p>
        ) : stats && stats.totalInterviews > 0 ? (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <StatCard label="Interviews Completed" value={stats.totalInterviews} />
              <StatCard label="Average Score" value={`${stats.averageScore}/100`} />
              <StatCard label="Best Score" value={`${stats.bestScore}/100`} />
            </div>

            {chartData.length >= 2 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="font-semibold text-gray-800 mb-4">Score Trend</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Interview History</h2>
              <div className="space-y-2">
                {interviews.map((interview) => {
                  const content = (
                    <>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {interview.type} • {interview.difficulty}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(interview.createdAt).toLocaleDateString()} — {interview.status}
                        </p>
                      </div>
                      {interview.status === 'completed' ? (
                        <span className="text-blue-600 font-semibold">{interview.overallScore}/100</span>
                      ) : (
                        <span className="text-amber-500 text-sm">Incomplete</span>
                      )}
                    </>
                  );
                  return interview.status === 'completed' ? (
                    <Link key={interview._id} to={`/interview/${interview._id}/results`}
                      className="flex justify-between items-center border border-gray-100 rounded px-4 py-3 hover:bg-gray-50">
                      {content}
                    </Link>
                  ) : (
                    <div key={interview._id}
                      className="flex justify-between items-center border border-gray-100 rounded px-4 py-3 opacity-60">
                      {content}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">You haven't completed any interviews yet.</p>
            <Link to="/interview-setup" className="text-blue-600 mt-2 inline-block">Start your first one →</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;