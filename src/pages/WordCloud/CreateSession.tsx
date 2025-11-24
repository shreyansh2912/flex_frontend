import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Clock, ArrowLeft } from 'lucide-react';

const CreateSession: React.FC = () => {
  const [timeLimit, setTimeLimit] = useState(60);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = useAuth();
  const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5001';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/api/word-cloud/sessions`,
        { timeLimit },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/word-cloud/admin/${response.data.data._id}`);
    } catch (err) {
      console.error('Failed to create session', err);
      alert('Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700 mb-6 flex items-center">
          <ArrowLeft size={20} className="mr-1" /> Back
        </button>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Session</h1>
        <p className="text-gray-500 mb-8">Set up your interactive word cloud room.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Limit (seconds)
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="number"
                min="10"
                max="3600"
                value={timeLimit}
                onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Duration for participants to submit words.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Room'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateSession;
