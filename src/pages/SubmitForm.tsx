import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import formService from '../services/formService';
import { useAuth } from '../context/AuthContext';

const SubmitForm: React.FC = () => {
  const { token } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchForm = async () => {
      if (token && id) {
        try {
          const response = await formService.getFormById(id, token);
          setForm(response);
        } catch (err) {
          setError('Failed to fetch form.');
        }
      }
    };
    fetchForm();
  }, [token, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (token && id) {
      try {
        await formService.submitForm(id, formData, token);
        setSuccess('Form submitted successfully!');
        setFormData({});
      } catch (err) {
        setError('Failed to submit form.');
      }
    }
  };

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>;
  }

  if (!form) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{form.title}</h1>
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">{success}</div>}
      <form onSubmit={handleSubmit}>
        {form.fields.map((field: any) => (
          <div key={field._id} className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">{field.label}</label>
            <input
              type={field.type}
              name={field.name}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        ))}
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default SubmitForm;
