import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Clock, Users } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const WordCloudDashboard: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const { token } = useAuth();
  const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5001';

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/word-cloud/sessions/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSessions(response.data.data);
      } catch (err) {
        console.error('Failed to fetch sessions', err);
      }
    };
    fetchSessions();
  }, [token]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Word Cloud Sessions</h1>
          <p className="text-gray-500 mt-1">Manage your interactive word cloud rooms</p>
        </div>
        <Link
          to="/word-cloud/create"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={20} /> Create New Session
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session) => (
          <div key={session._id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${
                session.status === 'active' ? 'bg-green-100 text-green-700' :
                session.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {session.status}
              </div>
              <span className="text-gray-400 text-sm">{new Date(session.createdAt).toLocaleDateString()}</span>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-gray-600">
                <Clock size={18} className="mr-2" />
                <span>{session.timeLimit} seconds limit</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Users size={18} className="mr-2" />
                <span>{session.words?.length || 0} words collected</span>
              </div>
            </div>

            <Link
              to={session.status === 'completed' ? `/word-cloud/results/${session._id}` : `/word-cloud/admin/${session._id}`}
              className="w-full block text-center py-2.5 rounded-lg border border-gray-200 hover:border-blue-500 hover:text-blue-600 transition-colors font-medium"
            >
              {session.status === 'completed' ? 'View Results' : 'Enter Room'}
            </Link>
          </div>
        ))}

        {sessions.length === 0 && (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 mb-4">No sessions created yet.</p>
            <Link to="/word-cloud/create" className="text-blue-600 font-medium hover:underline">
              Create your first session
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default WordCloudDashboard;
