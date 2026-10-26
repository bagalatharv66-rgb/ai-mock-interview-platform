import { useEffect, useState } from 'react';
import api from '../services/api';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [jobRoles, setJobRoles] = useState([]);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newRoleTitle, setNewRoleTitle] = useState('');
  const [newRoleSkills, setNewRoleSkills] = useState('');
  const [newRoleCompany, setNewRoleCompany] = useState('');
  const [error, setError] = useState('');

  const loadData = () => {
    api.get('/admin/stats').then((res) => setStats(res.data.data));
    api.get('/companies').then((res) => setCompanies(res.data.data));
    api.get('/job-roles').then((res) => setJobRoles(res.data.data));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddCompany = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/companies', { name: newCompanyName });
      setNewCompanyName('');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add company');
    }
  };

  const handleDeleteCompany = async (companyId) => {
    try {
      await api.delete(`/companies/${companyId}`);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete company');
    }
  };

  const handleAddRole = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/job-roles', {
        title: newRoleTitle,
        requiredSkills: newRoleSkills.split(',').map((s) => s.trim()).filter(Boolean),
        company: newRoleCompany || undefined,
      });
      setNewRoleTitle('');
      setNewRoleSkills('');
      setNewRoleCompany('');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add job role');
    }
  };

  const handleDeleteRole = async (roleId) => {
    try {
      await api.delete(`/job-roles/${roleId}`);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete job role');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Panel</h1>
        {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
              <p className="text-gray-500 text-xs mt-1">Candidates</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.totalInterviews}</p>
              <p className="text-gray-500 text-xs mt-1">Total Interviews</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.completedInterviews}</p>
              <p className="text-gray-500 text-xs mt-1">Completed</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.platformAverageScore}</p>
              <p className="text-gray-500 text-xs mt-1">Platform Avg Score</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Companies</h2>
            <form onSubmit={handleAddCompany} className="flex gap-2 mb-4">
              <input value={newCompanyName} onChange={(e) => setNewCompanyName(e.target.value)}
                placeholder="Company name" required
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm" />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm">Add</button>
            </form>
            <ul className="space-y-2">
              {companies.map((c) => (
                <li key={c._id} className="flex justify-between items-center text-sm border-b pb-2">
                  <span>{c.name}</span>
                  <button onClick={() => handleDeleteCompany(c._id)} className="text-red-500 text-xs">Delete</button>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Job Roles</h2>
            <form onSubmit={handleAddRole} className="space-y-2 mb-4">
              <input value={newRoleTitle} onChange={(e) => setNewRoleTitle(e.target.value)}
                placeholder="Role title" required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
              <input value={newRoleSkills} onChange={(e) => setNewRoleSkills(e.target.value)}
                placeholder="Skills, comma separated"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
              <select value={newRoleCompany} onChange={(e) => setNewRoleCompany(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                <option value="">— No company —</option>
                {companies.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm w-full">Add Role</button>
            </form>
            <ul className="space-y-2">
              {jobRoles.map((r) => (
                <li key={r._id} className="flex justify-between items-center text-sm border-b pb-2">
                  <span>{r.title}</span>
                  <button onClick={() => handleDeleteRole(r._id)} className="text-red-500 text-xs">Delete</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;