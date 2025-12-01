import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import formService from '../services/formService';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Plus, FileText, MessageSquare, BarChart2, Cloud } from 'lucide-react';

import type { IForm, ISession } from '../types';

const Dashboard: React.FC = () => {
  const { token, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'forms' | 'wordclouds' | 'polls' | 'qna'>('forms');
  
  const [forms, setForms] = useState<IForm[]>([]);
  const [wordClouds, setWordClouds] = useState<ISession[]>([]);
  const [polls, setPolls] = useState<ISession[]>([]);
  const [qnaSessions, setQnaSessions] = useState<ISession[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5001';

  useEffect(() => {
    const guestId = localStorage.getItem('guestId');
    if (!token && !guestId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const config = token 
          ? { headers: { Authorization: `Bearer ${token}` } }
          : { params: { hostId: guestId } };

        if (activeTab === 'forms' && forms.length === 0 && token) {
          const response = await formService.getForms(token);
          setForms(response);
        }
        else if (activeTab === 'wordclouds' && wordClouds.length === 0) {
          const response = await axios.get(`${BASE_URL}/api/word-cloud/sessions/my`, config);
          setWordClouds(response.data.data);
        }
        else if (activeTab === 'polls' && polls.length === 0) {
          const response = await axios.get(`${BASE_URL}/api/polls`, config);
          setPolls(response.data.data);
        }
        else if (activeTab === 'qna' && qnaSessions.length === 0) {
          const response = await axios.get(`${BASE_URL}/api/qna`, config);
          setQnaSessions(response.data.data);
        }
        setError(null);
      } catch (err: any) {
        console.error("Error fetching data:", err);
        if (err.response?.status === 401 && token) {
          logout();
        } else {
          setError('Failed to fetch data.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token, activeTab, logout]);

  const renderContent = () => {
    if (isLoading) return <div className="text-center py-10">Loading...</div>;

    if (activeTab === 'forms') {
      return forms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {forms.map((form) => (
            <div key={form._id} className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-4 border border-gray-100 dark:border-slate-700">
              <div className="flex items-center mb-2">
                <FileText className="text-blue-500 mr-2" size={20} />
                <h2 className="text-xl font-bold truncate text-gray-900 dark:text-white">{form.title}</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">{form.formType}</p>
              <div className="flex gap-2">
                <Link to={`/form/${form._id}`} className="flex-1">
                  <button className="w-full bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded text-sm transition-colors">
                    View
                  </button>
                </Link>
                <Link to={`/form/${form._id}/submissions`} className="flex-1">
                  <button className="w-full bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium py-2 px-4 rounded text-sm transition-colors">
                    Results
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : <EmptyState type="Form" link="/create-form" />;
    }

    if (activeTab === 'wordclouds') {
      return wordClouds.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wordClouds.map((session) => (
            <div key={session._id} className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-4 border border-gray-100 dark:border-slate-700">
              <div className="flex items-center mb-2">
                <Cloud className="text-purple-500 mr-2" size={20} />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Word Cloud</h2>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  session.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {session.status.toUpperCase()}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(session.createdAt).toLocaleDateString()}</span>
              </div>
              <Link to={session.status === 'completed' ? `/word-cloud/results/${session._id}` : `/word-cloud/admin/${session._id}`}>
                <button className="w-full bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-medium py-2 px-4 rounded text-sm transition-colors">
                  {session.status === 'completed' ? 'View Results' : 'Enter Room'}
                </button>
              </Link>
            </div>
          ))}
        </div>
      ) : <EmptyState type="Word Cloud" link="/word-cloud/create" />;
    }

    if (activeTab === 'polls') {
      return polls.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {polls.map((session) => (
            <div key={session._id} className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-4 border border-gray-100 dark:border-slate-700">
              <div className="flex items-center mb-2">
                <BarChart2 className="text-green-500 mr-2" size={20} />
                <h2 className="text-xl font-bold truncate text-gray-900 dark:text-white">{session.question || 'Untitled Poll'}</h2>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  session.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {session.status.toUpperCase()}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(session.createdAt).toLocaleDateString()}</span>
              </div>
              <Link to={`/poll/${session._id}`}>
                <button className="w-full bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 font-medium py-2 px-4 rounded text-sm transition-colors">
                  Enter Room
                </button>
              </Link>
            </div>
          ))}
        </div>
      ) : <EmptyState type="Poll" link="/create-poll" />;
    }

    if (activeTab === 'qna') {
      return qnaSessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {qnaSessions.map((session) => (
            <div key={session._id} className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-4 border border-gray-100 dark:border-slate-700">
              <div className="flex items-center mb-2">
                <MessageSquare className="text-orange-500 mr-2" size={20} />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Q&A Session</h2>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  session.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {session.status.toUpperCase()}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(session.createdAt).toLocaleDateString()}</span>
              </div>
              <Link to={`/qna/${session._id}`}>
                <button className="w-full bg-orange-50 dark:bg-orange-900/30 hover:bg-orange-100 dark:hover:bg-orange-900/50 text-orange-700 dark:text-orange-300 font-medium py-2 px-4 rounded text-sm transition-colors">
                  Enter Room
                </button>
              </Link>
            </div>
          ))}
        </div>
      ) : <EmptyState type="Q&A" link="/create-qna" />;
    }
  };

  const EmptyState = ({ type, link }: { type: string, link: string }) => (
    <div className="text-center py-12 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-gray-300 dark:border-slate-700">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">No {type}s yet</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new {type.toLowerCase()}.</p>
      <div className="mt-6">
        <Link to={link}>
          <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Create {type}
          </button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage all your interactive sessions in one place.</p>
        </div>
        
        {/* Create Dropdown (Simplified as separate buttons for now or a single primary action) */}
        <div className="mt-4 md:mt-0 flex gap-2">
           {/* Could be a dropdown, but direct links are fine for now */}
        </div>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-slate-700 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {[
            { id: 'forms', name: 'Forms', icon: FileText },
            { id: 'wordclouds', name: 'Word Clouds', icon: Cloud },
            { id: 'polls', name: 'Live Polls', icon: BarChart2 },
            { id: 'qna', name: 'Q&A', icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-slate-600'}
                `}
              >
                <Icon className={`
                  -ml-0.5 mr-2 h-5 w-5
                  ${activeTab === tab.id ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'}
                `} />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {renderContent()}
    </div>
  );
};

export default Dashboard;