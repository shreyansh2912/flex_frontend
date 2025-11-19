import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import formService from '../services/formService';
import { useAuth } from '../context/AuthContext';

interface IForm {
  _id: string;
  title: string;
  formType: string;
}

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
      } else {
        return;
      }
    };
    fetchForms();
  }, [token, logout]);


  return (
    <div className="container mx-auto p-4 ">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">My Forms</h1>
        <Link to="/create-form">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Create New Form
          </button>
        </Link>
      </div>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}
      {isLoading ? (
        <p>Loading forms...</p>
      ) : forms.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full leading-normal text-black">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {forms.map((form) => (
                <tr key={form._id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{form.title}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{form.formType ?? "single-page"}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <Link to={`/form/${form._id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">Open Form</Link>
                    <Link to={`/form/${form._id}/submissions`} className="text-green-600 hover:text-green-900">Data</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold">No forms yet!</h2>
          <p className="text-gray-500 mt-2">Click "Create New Form" to get started.</p>
        </div>
      )}
    </div>
  );
};

export default Forms;