import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import formService from '../services/formService';
import { useAuth } from '../context/AuthContext';

const ViewForm: React.FC = () => {
  const { token } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchForm = async () => {
      if (token && id) {
        try {
          const response = await formService.getFormById(id, token);
          setForm(response.data);
        } catch (err) {
          setError('Failed to fetch form.');
        }
      }
    };
    fetchForm();
  }, [token, id]);

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>;
  }

  if (!form) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{form.title}</h1>
      <p className="text-gray-600 mb-4">{form.formType}</p>
      <div>
        {form.fields.map((field: any) => (
          <div key={field._id} className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">{field.label}</label>
            <input type={field.type} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewForm;
