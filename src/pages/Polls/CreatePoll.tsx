import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';
import { Plus, Trash2, ArrowRight } from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

const CreatePoll: React.FC = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [socket, setSocket] = useState<any>(null);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });
    setSocket(newSocket);

    newSocket.on('pollCreated', (pollId) => {
      navigate(`/poll/${pollId}`);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [token, navigate]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleCreate = () => {
    if (!question || options.some(opt => !opt.trim())) return;
    
    let hostId = user?._id;
    if (!hostId) {
      hostId = localStorage.getItem('guestId') || undefined;
      if (!hostId) {
        hostId = 'guest_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('guestId', hostId);
      }
    }

    socket.emit('createPoll', { question, options, hostId });
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Create Live Poll</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
          <input 
            type="text" 
            value={question} 
            onChange={(e) => setQuestion(e.target.value)} 
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-lg" 
            placeholder="e.g., What is your favorite framework?"
          />
        </div>

        <div className="space-y-3 mb-6">
          <label className="block text-sm font-medium text-gray-700">Options</label>
          {options.map((opt, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input 
                type="text" 
                value={opt} 
                onChange={(e) => handleOptionChange(idx, e.target.value)} 
                className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder={`Option ${idx + 1}`}
              />
              <button 
                onClick={() => removeOption(idx)} 
                disabled={options.length <= 2}
                className="text-gray-400 hover:text-red-500 disabled:opacity-30"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          <button 
            onClick={addOption} 
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 mt-2"
          >
            <Plus size={16} /> Add Option
          </button>
        </div>

        <button 
          onClick={handleCreate} 
          disabled={!question || options.some(opt => !opt.trim())}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2 font-medium"
        >
          Create & Start Poll <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default CreatePoll;
