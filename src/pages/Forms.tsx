import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import formService from '../services/formService';
import { useAuth } from '../context/AuthContext';
import { Plus, ExternalLink, BarChart2, Trash2, Eye } from 'lucide-react';

import type { IForm } from '../types';

const Forms: React.FC = () => {
  const { token, logout } = useAuth();
  const [forms, setForms] = useState<IForm[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchForms = async () => {
      if (token) {
        setIsLoading(true);
        try {
          const response = await formService.getForms(token);
          setForms(response.data);
          setError(null);
        } catch (err : any) {
          if (err.response && err.response.data && err.response.data.message === 'Invalid token') {
            logout(); 
          } else {
            setError('Failed to fetch forms.');
          }
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchForms();
  }, [token, logout]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this form?')) {
      try {
        await formService.deleteForm(id, token!);
        setForms(forms.filter(f => f._id !== id));
      } catch (err) {
        alert('Failed to delete form');
      }
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Forms</h1>
          <p className="text-gray-500 mt-1">Manage and track your forms</p>
        </div>
        <Link to="/create-form">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all">
            <Plus size={20} />
            Create New Form
          </button>
        </Link>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : forms.length > 0 ? (
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visibility</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {forms.map((form) => (
                <tr key={form._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{form.title}</div>
                    <div className="text-xs text-gray-500">Created: {form.createdAt ? new Date(form.createdAt).toLocaleDateString() : 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {form.formType === 'multi-step' ? 'Multi Step' : 'Single Step'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {form.visibility === 'password-protected' ? (
                      <span className="flex items-center gap-1 text-amber-600"><Eye size={14} /> Protected</span>
                    ) : (
                      <span className="flex items-center gap-1 text-green-600"><Eye size={14} /> Public</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <a href={`/form/${form._id}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1" title="View Public Form">
                      <ExternalLink size={16} />
                    </a>
                    <Link to={`/form/${form._id}/submissions`} className="text-indigo-600 hover:text-indigo-900 inline-flex items-center gap-1" title="View Submissions">
                      <BarChart2 size={16} />
                    </Link>
                    <button onClick={() => handleDelete(form._id)} className="text-red-600 hover:text-red-900 inline-flex items-center gap-1" title="Delete Form">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <FileText size={48} />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No forms yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new form.</p>
          <div className="mt-6">
            <Link to="/create-form">
              <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Create New Form
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

import { FileText } from 'lucide-react'; // Added missing import

export default Forms;