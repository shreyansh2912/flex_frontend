import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/layout/Layout';
import { QRCodeSVG } from 'qrcode.react';

import type { IQnASession } from '../../types';

const QnARoom = () => {
  const { id } = useParams<{ id: string }>();
  const { user, token } = useAuth();
  const [session, setSession] = useState<IQnASession | null>(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000', {
      auth: { token },
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to Q&A socket');
      newSocket.emit('joinQnA', id);
    });

    newSocket.on('qnaState', (data: IQnASession) => {
      setSession(data);
    });

    newSocket.on('qnaUpdate', (data: IQnASession) => {
      setSession(data);
    });

    newSocket.on('error', (msg: string) => {
      setError(msg);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [id, token]);

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !socket) return;
    socket.emit('askQuestion', { qnaId: id, text: newQuestion });
    setNewQuestion('');
  };

  const handleUpvote = (questionId: string) => {
    if (!socket) return;
    socket.emit('upvoteQuestion', { qnaId: id, questionId });
  };

  const handleMarkAnswered = (questionId: string) => {
    if (!socket) return;
    socket.emit('markAnswered', { qnaId: id, questionId });
  };

  if (!session) return <Layout><div>Loading...</div></Layout>;

  const guestId = localStorage.getItem('guestId');
  const isHost = (user && session.hostId === user._id) || (session.hostId === guestId);
  const activeQuestions = session.questions
    .filter(q => !q.isAnswered)
    .sort((a, b) => b.upvotes - a.upvotes); // Sort by upvotes descending

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Live Q&A</h1>
          <div className="text-sm text-gray-500">
            ID: {id}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content: Questions List */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Questions ({activeQuestions.length})</h2>
              
              {activeQuestions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No questions yet. Be the first to ask!</p>
              ) : (
                <div className="space-y-4">
                  {activeQuestions.map((q) => (
                    <div key={q._id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-start hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <p className="text-lg text-gray-800">{q.text}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(q.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-center ml-4 space-y-2">
                        <div className="flex items-center space-x-1 bg-indigo-50 px-3 py-1 rounded-full">
                          <span className="font-bold text-indigo-600">{q.upvotes}</span>
                          <span className="text-indigo-600 text-sm">▲</span>
                        </div>
                        
                        <button
                          onClick={() => handleUpvote(q._id)}
                          className="text-sm text-gray-500 hover:text-indigo-600 underline"
                        >
                          Upvote
                        </button>

                        {isHost && (
                          <button
                            onClick={() => handleMarkAnswered(q._id)}
                            className="text-xs text-green-600 hover:text-green-800 border border-green-200 px-2 py-1 rounded"
                          >
                            ✔ Answered
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ask Question Input */}
            <div className="bg-white rounded-lg shadow-md p-6 sticky bottom-6">
              <form onSubmit={handleAsk} className="flex gap-4">
                <input
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!newQuestion.trim()}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ask
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar: Info & QR Code */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h3 className="text-lg font-semibold mb-4">Join Session</h3>
              <div className="flex justify-center mb-4">
                <QRCodeSVG value={window.location.href} size={150} />
              </div>
              <p className="text-center text-sm text-gray-500 break-all">
                {window.location.href}
              </p>
              
              {isHost && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold mb-2">Host Controls</h4>
                  <p className="text-sm text-gray-600">
                    Click "✔ Answered" on a question to remove it from the active list.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default QnARoom;
