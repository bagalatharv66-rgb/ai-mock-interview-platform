import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-gray-800">AI Mock Interview</Link>
      <div className="flex gap-4 items-center">
        {user ? (
          <>
            <Link to="/dashboard" className="text-gray-700">Dashboard</Link>
            <Link to="/resume" className="text-gray-700">Resume</Link>
            {user.role === 'admin' && (
              <Link to="/admin" className="text-purple-700 font-medium">Admin</Link>
            )}
            <span className="text-gray-500 text-sm">Hi, {user.name}</span>
            <button onClick={handleLogout} className="text-red-600">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-700">Login</Link>
            <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;