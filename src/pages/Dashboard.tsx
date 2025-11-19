import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import formService from '../services/formService';
import { useAuth } from '../context/AuthContext';

interface IForm {
  _id: string;
  title: string;
  formType: string;
}

const Dashboard: React.FC = () => {
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
          setForms(response);
          setError(null);
        } catch (err: any) {
          if (err.response && err.response.data && err.response.data.message === 'Invalid token') {
            // The token is invalid, so log the user out.
            logout();
            // No need to set an error message as the user will be redirected to login.
          } else {
            setError('Failed to fetch forms.');
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        // If there's no token, we can't fetch data.
        // This might happen if the token is expired and cleared from storage.
        // We log out to redirect the user to the login page.
        // We will simply wait for the token to be available.
        // If the AuthProvider determines the session is invalid, it will handle the logout.
        return;
      }
    };
    fetchForms();
  }, [token, logout]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {forms.map((form) => (
            <div key={form._id} className="bg-white shadow-md rounded-lg p-4">
              <h2 className="text-xl font-bold mb-2">{form.title}</h2>
              <p className="text-gray-600">{form.formType}</p>
              <div className="mt-4">
                <Link to={`/form/${form._id}`}>
                  <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2">
                    View
                  </button>
                </Link>
                <Link to={`/form/${form._id}/submissions`}>
                  <button className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
                    View Submissions
                  </button>
                </Link>
              </div>
            </div>
          ))}
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

export default Dashboard;