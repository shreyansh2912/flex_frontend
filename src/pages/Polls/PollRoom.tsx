import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

import { QRCodeSVG as QRCode } from 'qrcode.react';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

const PollRoom: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token, user } = useAuth();
  const [socket, setSocket] = useState<any>(null);
  const [poll, setPoll] = useState<any>(null);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    const guestId = localStorage.getItem('guestId');
    const newSocket = io(SOCKET_URL, {
      auth: { token, guestId },
      transports: ['websocket', 'polling']
    });
    setSocket(newSocket);

    // Always join to get state. If logged in, send name.
    if (user && user.name) {
      newSocket.emit('joinPoll', { pollId: id, name: user.name });
    } else {
      newSocket.emit('joinPoll', { pollId: id });
    }

    newSocket.on('pollState', (data) => setPoll(data));
    newSocket.on('pollStarted', (data) => setPoll(data));
    newSocket.on('pollUpdate', (data) => setPoll(data));
    newSocket.on('pollEnded', (data) => setPoll(data));

    return () => {
      newSocket.disconnect();
    };
  }, [id, token, user]);

  const handleStart = () => {
    socket.emit('startPoll', id);
  };

  const handleVote = (index: number) => {
    if (hasVoted) return;
    socket.emit('votePoll', { pollId: id, optionIndex: index });
    setHasVoted(true);
  };

  const handleEnd = () => {
    socket.emit('endPoll', id);
  };

  if (!poll) return <div className="p-8 text-center">Loading Poll...</div>;

  const guestId = localStorage.getItem('guestId');
  const isHost = (user && poll.hostId === user._id) || (poll.hostId === guestId);
  
  const joinLink = window.location.href;

  const chartData = {
    labels: poll.options.map((o: any) => o.text),
    datasets: [
      {
        label: 'Votes',
        data: poll.options.map((o: any) => o.count),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">{poll.question}</h1>
          <div className="px-4 py-1 rounded-full bg-gray-100 text-sm font-medium uppercase tracking-wide">
            {poll.status}
          </div>
        </div>

        {/* HOST VIEW */}
        {isHost ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: QR Code & Controls */}
            <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Join to Vote</h2>
              <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                <QRCode value={joinLink} size={200} />
              </div>
              <p className="text-sm text-gray-500 mb-6 text-center break-all px-4">
                {joinLink}
              </p>
              
              <div className="flex gap-4 w-full justify-center">
                {poll.status === 'waiting' && (
                  <button onClick={handleStart} className="w-full max-w-xs bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold shadow-md transition-all">
                    Start Voting
                  </button>
                )}
                {poll.status === 'active' && (
                  <button onClick={handleEnd} className="w-full max-w-xs bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-semibold shadow-md transition-all">
                    End Voting
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Live Results */}
            <div className="h-96 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-700 text-center">Live Results</h2>
              <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        ) : (
          /* PARTICIPANT VIEW */
          <div className="max-w-2xl mx-auto">
            {poll.status === 'active' ? (
              <div className="grid gap-4">
                {poll.options.map((opt: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => handleVote(idx)}
                    disabled={hasVoted}
                    className={`p-6 text-left border-2 rounded-xl transition-all transform hover:scale-[1.02] ${
                      hasVoted 
                        ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'bg-white border-blue-100 hover:border-blue-500 hover:shadow-md'
                    }`}
                  >
                    <span className="font-medium text-xl text-gray-800">{opt.text}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900">Waiting for host</h3>
                <p className="text-gray-500 mt-2">Voting will begin shortly...</p>
              </div>
            )}
            
            {hasVoted && (
              <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                <p className="text-green-700 font-semibold text-lg">Vote Submitted!</p>
                <p className="text-green-600 text-sm mt-1">Wait for the host to show results.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PollRoom;
