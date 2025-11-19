import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import formService from '../services/formService';
import { useAuth } from '../context/AuthContext';

interface ISubmission {
  _id: string;
  formData: Record<string, any>;
  createdAt: string;
}

const ViewSubmissions: React.FC = () => {
  const { id: formId } = useParams<{ id: string }>();
  const { token, logout } = useAuth();
  const [submissions, setSubmissions] = useState<ISubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!token || !formId) {
        // Wait for token and formId to be available
        return;
      }

      setIsLoading(true);
      try {
        const response = await formService.getFormSubmissions(formId, token);
        console.log(response);
        
        setSubmissions([{_id : "1", formData: [], createdAt:""}]);
        setError(null);
      } catch (err: any) {
        if (err.response && err.response.data && err.response.data.message === 'Invalid token') {
          logout();
        } else {
          setError('Failed to fetch form submissions.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, [formId, token, logout]);

  if (isLoading) {
    return <div className="container mx-auto p-4"><p>Loading submissions...</p></div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Form Submissions</h1>
        <Link to="/forms" className="text-blue-500 hover:underline">
          &larr; Back to Forms
        </Link>
      </div>

      {submissions.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Submission ID</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Data</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr key={submission._id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{submission._id}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm"><pre>{JSON.stringify(submission.formData, null, 2)}</pre></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No submissions have been recorded for this form yet.</p>
      )}
    </div>
  );
};

export default ViewSubmissions;