import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import formService from '../services/formService';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Download, PieChart as PieIcon, Table as TableIcon } from 'lucide-react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const COLORS = [
  'rgba(255, 99, 132, 0.6)',
  'rgba(54, 162, 235, 0.6)',
  'rgba(255, 206, 86, 0.6)',
  'rgba(75, 192, 192, 0.6)',
  'rgba(153, 102, 255, 0.6)',
  'rgba(255, 159, 64, 0.6)',
];

const BORDER_COLORS = [
  'rgba(255, 99, 132, 1)',
  'rgba(54, 162, 235, 1)',
  'rgba(255, 206, 86, 1)',
  'rgba(75, 192, 192, 1)',
  'rgba(153, 102, 255, 1)',
  'rgba(255, 159, 64, 1)',
];

const ViewSubmissions: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'table' | 'analytics'>('table');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [formRes, subRes] = await Promise.all([
          formService.getFormById(id!, token!),
          formService.getFormSubmissions(id!, token!)
        ]);
        setForm(formRes.data);
        setSubmissions(subRes.data);
      } catch (err) {
        setError('Failed to load submissions.');
      } finally {
        setLoading(false);
      }
    };
    if (token && id) fetchData();
  }, [id, token]);

  // Analytics Data Preparation
  const analyticsData = useMemo(() => {
    if (!form || !submissions.length) return [];

    return form.fields
      .filter((field: any) => ['radio', 'select', 'checkbox'].includes(field.type))
      .map((field: any) => {
        const counts: Record<string, number> = {};
        
        submissions.forEach(sub => {
          const value = sub.data[field.name];
          if (Array.isArray(value)) {
            value.forEach(v => {
              const key = String(v);
              counts[key] = (counts[key] || 0) + 1;
            });
          } else if (value) {
            const key = String(value);
            counts[key] = (counts[key] || 0) + 1;
          }
        });

        const labels = Object.keys(counts);
        const data = Object.values(counts);

        return {
          ...field,
          chartData: {
            labels,
            datasets: [
              {
                label: '# of Votes',
                data,
                backgroundColor: COLORS,
                borderColor: BORDER_COLORS,
                borderWidth: 1,
              },
            ],
          },
        };
      });
  }, [form, submissions]);

  if (loading) return <div className="flex justify-center p-10">Loading...</div>;
  if (error) return <div className="text-red-500 p-10">{error}</div>;

  const allKeys = Array.from(new Set(submissions.flatMap(s => Object.keys(s.data || {}))));
  
  const getLabel = (key: string) => {
    const field = form?.fields?.find((f: any) => f.name === key);
    return field ? field.label : key;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/forms" className="text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{form?.title}</h1>
            <p className="text-gray-500 mt-1">Total Responses: {submissions.length}</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 shadow-sm transition-all">
          <Download size={18} /> Export CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b">
        <button
          onClick={() => setActiveTab('table')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'table' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <TableIcon size={18} /> Responses
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'analytics' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <PieIcon size={18} /> Analytics
        </button>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow-sm text-center border border-dashed border-gray-300">
          <p className="text-gray-500 text-lg">No submissions yet. Share your form to collect responses!</p>
        </div>
      ) : (
        <>
          {activeTab === 'table' ? (
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Submitted At
                      </th>
                      {allKeys.map(key => (
                        <th key={key} className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {getLabel(key)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {submissions.map((submission) => (
                      <tr key={submission._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(submission.submittedAt).toLocaleString()}
                        </td>
                        {allKeys.map(key => (
                          <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {String(submission.data[key] || '-')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {analyticsData.map((field: any, idx: number) => (
                <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center">
                  <h3 className="text-lg font-bold text-gray-800 mb-6 border-b pb-2 w-full text-center">{field.label}</h3>
                  <div className="w-full h-[300px] flex justify-center">
                    {field.type === 'checkbox' ? (
                      <Bar 
                        data={field.chartData} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false },
                          }
                        }} 
                      />
                    ) : (
                      <Pie 
                        data={field.chartData} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
              {analyticsData.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  No multiple-choice questions found to analyze.
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ViewSubmissions;