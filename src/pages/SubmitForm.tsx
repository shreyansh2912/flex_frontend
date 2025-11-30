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
        await formService.submitResponse(id, formData);
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
    <div 
      className="min-h-screen p-4 flex justify-center"
      style={{ backgroundColor: form.theme?.backgroundColor || '#ffffff', color: form.theme?.textColor || '#000000' }}
    >
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center">{form.title}</h1>
        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">{success}</div>}
        
        <form onSubmit={handleSubmit} className="bg-white/50 backdrop-blur-sm p-6 rounded-lg shadow-sm" style={{ borderRadius: form.theme?.borderRadius || '4px' }}>
          {form.fields.map((field: any) => {
            // Logic Evaluation
            let isVisible = true;
            if (field.logic && field.logic.action && field.logic.when) {
              const controllingValue = formData[field.logic.when];
              const targetValue = field.logic.equals;
              const match = String(controllingValue) === String(targetValue);
              
              if (field.logic.action === 'show') {
                isVisible = match;
              } else if (field.logic.action === 'hide') {
                isVisible = !match;
              }
            }

            if (!isVisible) return null;

            return (
              <div key={field._id} className="mb-6">
                <label className="block font-bold mb-2" style={{ color: form.theme?.textColor || '#000000' }}>{field.label}</label>
                {field.type === 'select' ? (
                   <select
                    name={field.name}
                    onChange={handleChange}
                    className="shadow border w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2"
                    style={{ 
                      borderRadius: form.theme?.borderRadius || '4px',
                      borderColor: form.theme?.primaryColor || '#3b82f6'
                    }}
                   >
                     <option value="">Select an option</option>
                     {field.options?.map((opt: string) => (
                       <option key={opt} value={opt}>{opt}</option>
                     ))}
                   </select>
                ) : field.type === 'radio' ? (
                  <div className="flex flex-col gap-2">
                    {field.options?.map((opt: string) => (
                      <label key={opt} className="inline-flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name={field.name}
                          value={opt}
                          onChange={handleChange}
                          className="form-radio h-4 w-4"
                          style={{ color: form.theme?.primaryColor || '#3b82f6' }}
                        />
                        <span className="ml-2">{opt}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    onChange={handleChange}
                    className="shadow appearance-none border w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2"
                    style={{ 
                      borderRadius: form.theme?.borderRadius || '4px',
                      borderColor: form.theme?.primaryColor || '#3b82f6',
                      color: '#000000' // Keep input text readable
                    }}
                  />
                )}
              </div>
            );
          })}
          <button
            type="submit"
            className="font-bold py-3 px-6 w-full transition-colors duration-200"
            style={{ 
              backgroundColor: form.theme?.primaryColor || '#3b82f6', 
              color: '#ffffff',
              borderRadius: form.theme?.borderRadius || '4px'
            }}
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitForm;
