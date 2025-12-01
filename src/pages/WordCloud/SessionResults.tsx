import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import html2canvas from 'html2canvas';
import D3WordCloud from '../../components/D3WordCloud';
import { Trophy, ArrowLeft, Download, Image as ImageIcon } from 'lucide-react';

const SessionResults: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<any>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5001';

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/word-cloud/sessions/${id}`);
        setSession(response.data.data);
      } catch (err) {
        console.error('Failed to fetch session', err);
      }
    };
    fetchSession();
  }, [id]);

  const cloudData = useMemo(() => {
    if (!session?.words) return [];
    return session.words.map((w: any) => ({ text: w.text, value: w.count }));
  }, [session]);

  const sortedWords = useMemo(() => {
    if (!session?.words) return [];
    return [...session.words].sort((a: any, b: any) => b.count - a.count);
  }, [session]);

  const handleExport = () => {
    if (!session?.words) return;

    const headers = ['Word', 'Count', 'Last Active'];
    const csvContent = [
      headers.join(','),
      ...session.words.map((w: any) => 
        [`"${w.text}"`, w.count, `"${new Date(w.timestamp).toLocaleString()}"`].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `wordcloud_session_${id}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImageExport = async () => {
    if (resultsRef.current) {
      try {
        const canvas = await html2canvas(resultsRef.current);
        const image = canvas.toDataURL("image/png");
        const link = document.createElement('a');
        link.href = image;
        link.download = `wordcloud_session_${id}.png`;
        link.click();
      } catch (err) {
        console.error("Failed to export image:", err);
      }
    }
  };

  if (!session) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link to="/word-cloud" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center">
            <ArrowLeft size={20} className="mr-1" /> Back to Dashboard
          </Link>
          <div className="flex gap-3">
            <button 
              onClick={handleImageExport}
              className="flex items-center gap-2 text-purple-600 font-medium hover:bg-purple-50 px-4 py-2 rounded-lg transition-colors border border-purple-200"
            >
              <ImageIcon size={20} /> Export PNG
            </button>
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 text-blue-600 font-medium hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors border border-blue-200"
            >
              <Download size={20} /> Export CSV
            </button>
          </div>
        </div>

        <div ref={resultsRef} className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 dark:bg-gray-800">
          <div className="p-8 text-center border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <h1 className="text-4xl font-bold mb-2">Session Results</h1>
            <p className="opacity-90">Total Words Collected: {session.words.length}</p>
          </div>
          
          <div className="p-8 flex justify-center bg-gray-50 dark:bg-gray-800">
            <D3WordCloud words={cloudData} height={500} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-md p-6 dark:bg-gray-800">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 dark:text-white">
              <Trophy className="text-yellow-500" /> Top Words
            </h2>
            <div className="space-y-4">
              {sortedWords.slice(0, 5).map((word: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 dark:bg-gray-700">
                  <div className="flex items-center gap-4">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${
                      idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                      idx === 1 ? 'bg-gray-200 text-gray-700' :
                      idx === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-50 text-blue-600'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="text-lg font-medium text-gray-900 capitalize">{word.text}</span>
                  </div>
                  <span className="font-bold text-gray-600">{word.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 dark:bg-gray-800">
            <h2 className="text-xl font-bold text-gray-800 mb-6 dark:text-white">All Submissions</h2>
            <div className="overflow-y-auto max-h-[400px]">
              <table className="w-full text-left">
                <thead className="text-gray-500 text-sm border-b dark:text-gray-400">
                  <tr>
                    <th className="pb-3 pl-2">Word</th>
                    <th className="pb-3">Count</th>
                    <th className="pb-3">Last Active</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {sortedWords.map((word: any, idx: number) => (
                    <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 pl-2 font-medium capitalize">{word.text}</td>
                      <td className="py-3">{word.count}</td>
                      <td className="py-3 text-sm text-gray-500">{new Date(word.timestamp).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionResults;
