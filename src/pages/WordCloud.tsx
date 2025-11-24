import React, { useState, useEffect, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import D3WordCloud from '../components/D3WordCloud';
import { Send, Cloud, Wifi, WifiOff } from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

interface WordData {
  text: string;
  value: number;
}

const WordCloudPage: React.FC = () => {
  const { token } = useAuth();
  const [words, setWords] = useState<WordData[]>([]);
  const [inputWord, setInputWord] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'Connecting' | 'Connected' | 'Disconnected' | 'Error'>('Connecting');
  
  // Transform raw counts into sizes suitable for D3
  const cloudData = useMemo(() => {
    if (words.length === 0) return [];
    const max = Math.max(...words.map(w => w.value), 1);
    
    // Normalize values to a reasonable font size range (e.g., 20px to 100px)
    return words.map(word => ({
      text: word.text,
      value: word.value, // Pass raw value, D3 component handles scaling logic if needed, or pre-scale here
    }));
  }, [words]);

  useEffect(() => {
    if (!token) {
      setConnectionStatus('Disconnected');
      return;
    }
    
    const newSocket = io(SOCKET_URL, { 
      auth: { token },
      transports: ['websocket', 'polling']
    });
    
    newSocket.on('connect', () => {
      console.log('Connected to socket');
      setConnectionStatus('Connected');
    });
    
    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setConnectionStatus('Error');
    });

    newSocket.on('initialWords', (data: WordData[]) => {
      setWords(data);
    });

    newSocket.on('wordCloudUpdate', (data: WordData[]) => {
      setWords(data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const word = inputWord.trim();
    if (word && socket?.connected) {
      socket.emit('submitWord', word.toLowerCase());
      setInputWord('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 flex justify-center items-center gap-3">
            <Cloud className="text-blue-600" size={48} />
            Live Word Cloud
          </h1>
          <p className="text-gray-500 text-lg">Join the conversation instantly.</p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          
          {/* Status Bar */}
          <div className="bg-gray-50 px-6 py-3 border-b flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${connectionStatus === 'Connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium text-gray-600 uppercase tracking-wider">{connectionStatus}</span>
            </div>
            <div className="text-sm text-gray-500">
              Total Words: <span className="font-bold text-gray-900">{words.length}</span>
            </div>
          </div>

          {/* Word Cloud Visualization */}
          <div className="h-[400px] md:h-[500px] w-full flex items-center justify-center bg-white p-4">
            {words.length > 0 ? (
              <D3WordCloud words={cloudData} height={500} />
            ) : (
              <div className="text-center text-gray-400">
                <Cloud size={64} className="mx-auto mb-4 opacity-20" />
                <p className="text-xl">Waiting for submissions...</p>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="bg-gray-50 p-6 border-t">
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto flex gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputWord}
                  onChange={(e) => setInputWord(e.target.value)}
                  placeholder="Type a word..."
                  className="w-full pl-6 pr-4 text-black py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-lg shadow-sm"
                  maxLength={20}
                  disabled={connectionStatus !== 'Connected'}
                />
              </div>
              <button
                type="submit"
                disabled={connectionStatus !== 'Connected' || !inputWord.trim()}
                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Send <Send size={20} />
              </button>
            </form>
            <p className="text-center text-gray-400 text-sm mt-4">
              Max 20 characters. Keep it clean!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordCloudPage;