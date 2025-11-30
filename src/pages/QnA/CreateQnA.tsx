import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/layout/Layout';
import { io } from 'socket.io-client';

const CreateQnA = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleCreate = () => {
    let hostId = user?._id;
    if (!hostId) {
      hostId = localStorage.getItem('guestId');
      if (!hostId) {
        hostId = 'guest_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('guestId', hostId);
      }
    }

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000', {
      auth: { token },
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    socket.on('connect', () => {
      console.log('Connected to socket');
      socket.emit('createQnA', { hostId });
    });

    socket.on('qnaCreated', (qnaId) => {
      console.log('Q&A Created:', qnaId);
      socket.disconnect();
      navigate(`/qna/${qnaId}`);
    });

    socket.on('error', (msg) => {
      setError(msg);
    });
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-indigo-600">Start a Q&A Session</h1>
        
        <div className="text-center">
          <p className="mb-8 text-gray-600">
            Create a live Q&A room where participants can ask questions and upvote the best ones.
          </p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <button
            onClick={handleCreate}
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors"
          >
            Start Q&A Session
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default CreateQnA;
