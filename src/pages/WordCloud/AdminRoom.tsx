import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../../context/AuthContext';
import D3WordCloud from '../../components/D3WordCloud';
import { Play, Clock, Share2, Users } from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

const AdminRoom: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [session, setSession] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [words, setWords] = useState<any[]>([]);
  const [recentWords, setRecentWords] = useState<any[]>([]);
  const [qrColor, setQrColor] = useState('#000000');

  const joinUrl = `${window.location.origin}/word-cloud/join/${id}`;

  const cloudData = useMemo(() => {
    return words.map(w => ({ text: w.text, value: w.count }));
  }, [words]);

  useEffect(() => {
    if (!token) {
      console.log('AdminRoom: No token yet, waiting...');
      return;
    }

    console.log('AdminRoom: Connecting with token:', token.substring(0, 10) + '...');
    
    // Decode token to see user ID (debug only)
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      console.log('AdminRoom: Token payload:', JSON.parse(jsonPayload));
    } catch (e) {
      console.error('Error decoding token:', e);
    }

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      newSocket.emit('joinSession', id);
    });

    newSocket.on('sessionState', (data) => {
      setSession(data);
      setWords(data.words || []);
      if (data.status === 'active' && data.endTime) {
        const end = new Date(data.endTime).getTime();
        const now = new Date().getTime();
        setTimeLeft(Math.max(0, Math.floor((end - now) / 1000)));
      } else if (data.status === 'completed') {
        navigate(`/word-cloud/results/${id}`);
      }
    });

    newSocket.on('sessionStarted', ({ endTime }) => {
      setSession((prev: any) => ({ ...prev, status: 'active' }));
      const end = new Date(endTime).getTime();
      const now = new Date().getTime();
      setTimeLeft(Math.max(0, Math.floor((end - now) / 1000)));
    });

    newSocket.on('sessionEnded', () => {
      navigate(`/word-cloud/results/${id}`);
    });

    newSocket.on('wordUpdate', (updatedWords) => {
      setWords(updatedWords);
    });

    newSocket.on('newWord', (wordData) => {
      setRecentWords(prev => [wordData, ...prev].slice(0, 50)); // Keep last 50
    });

    newSocket.on('debug', (msg) => {
      console.log('[SERVER DEBUG]:', msg);
    });

    newSocket.on('error', (msg) => {
      console.error('[SERVER ERROR]:', msg);
      alert(`Error: ${msg}`);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [id, token, navigate]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleStart = () => {
    console.log("Handle start called");
    socket?.emit('startSession', id);
  };

  if (!session) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <div className="bg-white rounded-2xl shadow-lg flex-1 flex flex-col overflow-hidden relative">
          
          {/* Header */}
          <div className="p-6 border-b flex justify-between items-center bg-white z-10">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Live Session</h1>
              <p className="text-gray-500 text-sm">Room ID: {id}</p>
            <div className='text-black'>{session.status}</div>
            </div>
            {session.status === 'waiting' ? (
              <button
                onClick={handleStart}
                className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-green-700 transition-all shadow-lg flex items-center gap-2 animate-pulse"
              >
                <Play size={24} fill="currentColor" /> START SESSION
              </button>
            ) : (
              <div className="bg-red-50 text-red-600 px-6 py-2 rounded-lg font-mono text-2xl font-bold border border-red-100 flex items-center gap-2">
                <Clock size={24} />
                {Math.floor((timeLeft || 0) / 60)}:{(timeLeft || 0) % 60 < 10 ? '0' : ''}{(timeLeft || 0) % 60}
              </div>
            )}
          </div>

          {/* Word Cloud Area */}
          <div className="flex-1 relative bg-gray-50 flex items-center justify-center overflow-hidden">
            {words.length > 0 ? (
              <D3WordCloud words={cloudData} height={600} />
            ) : (
              <div className="text-center text-gray-400">
                <p className="text-xl">Waiting for words...</p>
              </div>
            )}

            {/* Overlay for Waiting State */}
            {session.status === 'waiting' && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                <div className="bg-white p-8 rounded-3xl shadow-2xl text-center border border-gray-100 max-w-md w-full">
                  <h2 className="text-3xl font-bold mb-6 text-gray-800">Join the Session</h2>
                  <div className="bg-white p-4 rounded-xl shadow-inner border inline-block mb-6">
                    <QRCodeSVG value={joinUrl} size={200} fgColor={qrColor} />
                  </div>
                  
                  {/* Color Picker */}
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <label className="text-sm font-medium text-gray-600">QR Color:</label>
                    <input 
                      type="color" 
                      value={qrColor}
                      onChange={(e) => setQrColor(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                    />
                  </div>

                  <p className="text-gray-600 mb-6 font-medium break-all bg-gray-50 p-3 rounded-lg text-sm border">
                    {joinUrl}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-blue-600 font-medium">
                    <Users size={20} />
                    <span>Scan to join</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Timeline */}
      <div className="w-80 bg-white border-l shadow-xl flex flex-col">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="font-bold text-gray-700 flex items-center gap-2">
            <Share2 size={18} /> Live Feed
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {recentWords.map((item, idx) => (
            <div key={idx} className="bg-blue-50 p-3 rounded-lg border border-blue-100 animate-in slide-in-from-right fade-in duration-300">
              <p className="font-bold text-blue-800 text-lg">{item.text}</p>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-blue-400">{item.user}</span>
                <span className="text-xs text-blue-300">{new Date(item.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
          {recentWords.length === 0 && (
            <p className="text-center text-gray-400 text-sm mt-10">No words yet...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRoom;
