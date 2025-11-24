import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import formService from '../services/formService';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Download } from 'lucide-react';

const ViewSubmissions: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) return <div className="flex justify-center p-10">Loading...</div>;
  if (error) return <div className="text-red-500 p-10">{error}</div>;

  // Extract all unique keys from submissions to build table headers
  const allKeys = Array.from(new Set(submissions.flatMap(s => Object.keys(s.data || {}))));
  
  // Map keys to field labels if possible
  const getLabel = (key: string) => {
    const field = form?.fields?.find((f: any) => f.name === key);
    return field ? field.label : key;
  };

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/forms" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{form?.title} - Submissions</h1>
            <p className="text-gray-500 text-sm">Total Responses: {submissions.length}</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 text-gray-700">
          <Download size={18} /> Export CSV
        </button>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-white p-10 rounded-xl shadow-sm text-center text-gray-500">
          No submissions yet. Share your form to collect responses!
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted At
                </th>
                {allKeys.map(key => (
                  <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {getLabel(key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {submissions.map((submission) => (
                <tr key={submission._id} className="hover:bg-gray-50">
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
      )}
    </div>
  );
};

export default ViewSubmissions;