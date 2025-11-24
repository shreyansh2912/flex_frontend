import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import formService from '../services/formService';
import { useAuth } from '../context/AuthContext';

interface IForm {
  _id: string;
  title: string;
  visibility: 'public' | 'private';
}

const ShareForm: React.FC = () => {
  const { id: formId } = useParams<{ id: string }>();
  const { token, logout } = useAuth();

  const [form, setForm] = useState<IForm | null>(null);
  const [emails, setEmails] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareSuccess, setShareSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchFormDetails = async () => {
      if (!token || !formId) return;

      try {
        const response = await formService.getFormById(formId, token);
        setForm(response.data);
      } catch (err: any) {
        if (err.response?.data?.message === 'Invalid token') {
          logout();
        } else {
          setError('Failed to load form details.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormDetails();
  }, [formId, token, logout]);

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !formId || !emails.trim()) return;

    setIsSharing(true);
    setError(null);
    setShareSuccess(null);

    const emailList = emails.split(',').map(email => email.trim()).filter(Boolean);

    try {
      await formService?.shareForm(formId, emailList, token);
      setShareSuccess(`Successfully shared the form with ${emailList.length} user(s).`);
      setEmails(''); // Clear input after success
    } catch (err: any) {
      if (err.response?.data?.message === 'Invalid token') {
        logout();
      } else {
        setError('Failed to share the form. Please try again.');
      }
    } finally {
      setIsSharing(false);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto p-4"><p>Loading...</p></div>;
  }

  if (error && !form) {
    return <div className="container mx-auto p-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Form Created Successfully!</h1>
      <p className="text-gray-600 mb-6">Now, share your form with others.</p>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold">{form?.title}</h2>
        <p className="capitalize text-sm text-gray-500">Visibility: {form?.visibility}</p>
      </div>

      <form onSubmit={handleShare} className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Share via Email</h3>
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        {shareSuccess && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{shareSuccess}</div>}
        
        <div className="mb-4">
          <label htmlFor="emails" className="block text-gray-700 font-bold mb-2">
            Enter email addresses (comma-separated)
          </label>
          <textarea
            id="emails"
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24"
            placeholder="user1@example.com, user2@example.com"
          />
        </div>
        <div className="flex items-center justify-between">
          <button type="submit" disabled={isSharing || !emails.trim()} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-blue-300">
            {isSharing ? 'Sharing...' : 'Send Invitations'}
          </button>
          <Link to="/forms" className="text-gray-600 hover:underline">Skip and go to My Forms</Link>
        </div>
      </form>
    </div>
  );
};

export default ShareForm;