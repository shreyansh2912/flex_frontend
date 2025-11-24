import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { Send, Clock, CheckCircle } from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

const ParticipantRoom: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<'connecting' | 'waiting' | 'active' | 'completed'>('connecting');
  const [inputWord, setInputWord] = useState('');
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submittedWords, setSubmittedWords] = useState<string[]>([]);

  useEffect(() => {
    console.log('Initializing socket with URL:', SOCKET_URL);
    const newSocket = io(SOCKET_URL, { 
      transports: ['polling'], // Force polling to test connectivity
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      newSocket.emit('joinSession', id);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    newSocket.on('sessionState', (data) => {
      console.log('Received session state:', data);
      setStatus(data.status);
      if (data.status === 'active' && data.endTime) {
        const end = new Date(data.endTime).getTime();
        const now = new Date().getTime();
        setTimeLeft(Math.max(0, Math.floor((end - now) / 1000)));
      } else if (data.status === 'completed') {
        navigate(`/word-cloud/results/${id}`);
      }
    });

    newSocket.on('sessionStarted', (data) => {
      console.log('Received sessionStarted event:', data);
      setStatus('active');
      const end = new Date(data.endTime).getTime();
      const now = new Date().getTime();
      setTimeLeft(Math.max(0, Math.floor((end - now) / 1000)));
    });

    newSocket.on('sessionEnded', () => {
      setStatus('completed');
      navigate(`/word-cloud/results/${id}`);
    });

    newSocket.on('debug', (msg) => {
      console.log('[SERVER DEBUG]:', msg);
    });

    newSocket.on('error', (msg) => {
      console.error('[SERVER ERROR]:', msg);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [id, navigate]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputWord.trim() && socket) {
      socket.emit('submitWord', { sessionId: id, word: inputWord });
      setSubmittedWords(prev => [inputWord, ...prev]);
      setInputWord('');
    }
  };

  if (status === 'connecting') return <div className="h-screen flex items-center justify-center">Connecting...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-blue-600 p-6 text-white text-center">
          <h1 className="text-2xl font-bold">Word Cloud Session</h1>
          {status === 'waiting' && <p className="opacity-80 mt-2">Waiting for host to start...</p>}
          {status === 'active' && (
            <div className="mt-4 flex justify-center items-center gap-2 bg-blue-700 py-2 rounded-lg font-mono text-xl">
              <Clock size={20} />
              {Math.floor((timeLeft || 0) / 60)}:{(timeLeft || 0) % 60 < 10 ? '0' : ''}{(timeLeft || 0) % 60}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-8">
          {status === 'waiting' ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Get ready to type!</p>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="mb-8">
                <input
                  type="text"
                  value={inputWord}
                  onChange={(e) => setInputWord(e.target.value)}
                  placeholder="Type a word..."
                  className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all mb-4"
                  autoFocus
                  maxLength={20}
                />
                <button
                  type="submit"
                  disabled={!inputWord.trim()}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
                >
                  Send <Send size={20} className="inline ml-2" />
                </button>
              </form>

              <div className="border-t pt-6">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Your Submissions</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {submittedWords.map((word, idx) => (
                    <div key={idx} className="flex items-center text-green-600 bg-green-50 p-2 rounded-lg">
                      <CheckCircle size={16} className="mr-2" />
                      <span className="font-medium">{word}</span>
                    </div>
                  ))}
                  {submittedWords.length === 0 && (
                    <p className="text-center text-gray-400 text-sm">You haven't submitted any words yet.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipantRoom;
