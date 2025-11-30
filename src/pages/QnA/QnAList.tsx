import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Plus, MessageCircle, ExternalLink } from 'lucide-react';

interface IQnA {
  _id: string;
  status: string;
  createdAt: string;
  questions: any[];
}

const QnAList: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<IQnA[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5001';

  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoading(true);
      const guestId = localStorage.getItem('guestId');
      
      try {
        const config = {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          params: { hostId: guestId }
        };

        const response = await axios.get(`${BASE_URL}/api/qna`, config);
        setSessions(response.data.data);
      } catch (err) {
        console.error("Error fetching Q&A sessions:", err);
        setError("Failed to load Q&A sessions.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [token]);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <MessageCircle className="text-purple-600" size={32} />
            My Q&A Sessions
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Manage and view your Q&A sessions</p>
        </div>
        <Link 
          to="/create-qna" 
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-semibold shadow-md flex items-center gap-2 transition-all"
        >
          <Plus size={20} />
          Create Q&A
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading sessions...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
          {error}
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-gray-300 dark:border-slate-700">
          <MessageCircle className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={64} />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">No Q&A sessions yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">Create your first Q&A session to get started!</p>
          <Link 
            to="/create-qna" 
            className="text-purple-600 dark:text-purple-400 font-medium hover:underline"
          >
            Create a new Q&A &rarr;
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Session ID</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Questions</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Date</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {sessions.map((session) => (
                <tr key={session._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm text-gray-600 dark:text-gray-400">
                    {session._id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${
                      session.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {session.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {session.questions.length} questions
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">
                    {new Date(session.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => navigate(`/qna/${session._id}`)}
                        className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 p-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-full transition-colors"
                        title="View Q&A"
                      >
                        <ExternalLink size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default QnAList;
