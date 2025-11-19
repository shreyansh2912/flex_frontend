import React, { useState, useEffect, useMemo } from 'react';
import WordCloud from 'react-d3-cloud';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

interface WordData {
  text: string;
  value: number;
}

const WordCloudComponent: React.FC = () => {
  const { token } = useAuth();
  const [words, setWords] = useState<WordData[]>([]);
  const [inputWord, setInputWord] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'Connecting' | 'Connected' | 'Disconnected' | 'Error'>('Connecting');
  const cloudData = useMemo(() => {
    if (words.length === 0) return [];
    const max = Math.max(...words.map(w => w.value), 1);
    
    return words.map(word => ({
      text: word.text,
      value: word.value === max ? 130 : Math.max(25, word.value * 9),
    }));
  }, [words]);
  const fontSize = (word: { value: number }) => word.value;
  useEffect(() => {
    
    if (!token) {
      setConnectionStatus('Disconnected');
      return;
    }
    console.log(SOCKET_URL);
    
    const newSocket = io(SOCKET_URL, { auth: { token } });
    console.log(newSocket);
    
    newSocket.on('connect', () => {
      console.log('Connected!');
      setConnectionStatus('Connected');
    });
    newSocket.on('connect_error', () => setConnectionStatus('Error'));
    // These are the ONLY times the cloud should update
    newSocket.on('initialWords', (data: WordData[]) => {
      console.log('Initial words:', data);
      setWords(data);
    });
    newSocket.on('wordCloudUpdate', (data: WordData[]) => {
      console.log('Update received:', data);
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
      setInputWord(''); // Clear input
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-7xl font-black text-center mb-8 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
          LIVE WORD CLOUD
        </h1>
        {/* STABLE WORD CLOUD — NO JUMPING */}
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl shadow-2xl p-12 mb-10 border-4 border-purple-500">
          {cloudData.length > 0 ? (
            <WordCloud
              key="stable-cloud"
              data={cloudData}
              fontSize={fontSize}
              rotate={() => 0}
              padding={6}
              width={1000}
              height={300}
              font="Impact, Arial Black, sans-serif"
              fontWeight="bold"
              fill={(_d: any, i : any) => ['#8B5CF6', '#EC4899', '#3B82F6', '#F59E0B', '#10B981', '#F43F5E'][i % 6]}
            />
          ) : (
            <div className="h-96 flex items-center justify-center">
              <p className="text-6xl text-gray-600 font-bold animate-pulse">
                Waiting for words...
              </p>
            </div>
          )}
        </div>
        {/* Input — typing here NO LONGER moves words */}
        <form onSubmit={handleSubmit} className="flex gap-6 max-w-4xl mx-auto">
          <input
            type="text"
            value={inputWord}
            onChange={(e) => setInputWord(e.target.value)}
            placeholder="Type a word and hit Enter"
            className="flex-1 px-10 py-8 text-3xl rounded-3xl border-4 border-purple-400 bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:border-purple-600 shadow-2xl"
            maxLength={30}
            disabled={connectionStatus !== 'Connected'}
          />
          <button
            type="submit"
            disabled={connectionStatus !== 'Connected'}
            className="px-16 py-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-3xl font-bold rounded-3xl shadow-2xl hover:scale-110 transform transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            SEND
          </button>
        </form>
        <div className="text-center mt-10">
          <span className={`inline-block px-10 py-5 rounded-full text-3xl font-bold shadow-2xl
            ${connectionStatus === 'Connected' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
          `}>
            {connectionStatus === 'Connected' ? 'LIVE' : 'CONNECTING...'}
          </span>
        </div>
        <p className="text-center mt-8 text-2xl text-gray-700">
          Total unique words: <span className="font-bold text-4xl text-purple-600">{words.length}</span>
        </p>
      </div>
    </div>
  );
};

export default WordCloudComponent;