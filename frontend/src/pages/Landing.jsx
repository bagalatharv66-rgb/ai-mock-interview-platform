import { Link } from 'react-router-dom';

function Landing() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center max-w-xl px-4">
        <h1 className="text-4xl font-bold text-gray-800">AI Mock Interview Platform</h1>
        <p className="mt-4 text-gray-600">
          Practice technical and HR interviews with AI-generated questions, real-time feedback, and performance analytics.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <Link to="/register" className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700">
            Get Started
          </Link>
          <Link to="/login" className="border border-gray-300 px-6 py-3 rounded hover:bg-gray-50">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Landing;