import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import formService from '../services/formService';
import { CheckCircle, AlertCircle, ChevronRight, ChevronLeft, Upload } from 'lucide-react';
import axios from 'axios';

const PublicForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState<any>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await formService.getPublicForm(id!);
        setForm(response.data);
      } catch (err) {
        setError('Form not found or access denied.');
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [id]);

  const handleChange = (name: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev: any) => ({ ...prev, [name]: null }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL || 'http://localhost:5000'}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      handleChange(fieldName, response.data.data.url);
    } catch (err) {
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const validatePage = () => {
    const errors: any = {};
    const currentFields = form.fields.filter((f: any) => (f.page || 1) === currentPage);
    
    currentFields.forEach((field: any) => {
      if (field.validation?.required && !formData[field.name]) {
        errors[field.name] = 'This field is required';
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validatePage()) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    setCurrentPage(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePage()) return;

    try {
      await formService.submitResponse(id!, formData);
      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit form. Please try again.');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  if (submitted) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <CheckCircle size={64} className="text-green-500 mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Thank You!</h1>
        <p className="text-gray-600">Your response has been recorded.</p>
      </div>
    );
  }

  const { theme } = form;
  const containerStyle = {
    backgroundColor: theme?.backgroundColor || '#ffffff',
    color: theme?.textColor || '#000000',
    minHeight: '100vh',
  };

  const currentFields = form.fields
    .filter((f: any) => (f.page || 1) === currentPage)
    .sort((a: any, b: any) => a.sequence - b.sequence);

  const totalPages = Math.max(...form.fields.map((f: any) => f.page || 1), 1);

  return (
    <div style={containerStyle} className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="max-w-3xl w-full space-y-8">
        <div className="text-center border-b pb-6" style={{ borderColor: theme?.primaryColor }}>
          <h1 className="text-4xl font-bold" style={{ color: theme?.primaryColor }}>{form.title}</h1>
          {form.description && <p className="mt-2 text-lg opacity-80">{form.description}</p>}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center items-center space-x-2">
              <span className="text-sm font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-wrap -mx-2">
            {currentFields.map((field: any) => (
              <div 
                key={field.id} 
                className="px-2 mb-6" 
                style={{ width: field.layout?.width || '100%' }}
              >
                <label className="block text-sm font-medium mb-2 opacity-90">
                  {field.label}
                  {field.validation?.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                
                {field.type === 'textarea' ? (
                  <textarea
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-shadow ${validationErrors[field.name] ? 'border-red-500' : 'border-gray-300'}`}
                    style={{ borderRadius: theme?.borderRadius }}
                    placeholder={field.placeholder}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    value={formData[field.name] || ''}
                  />
                ) : field.type === 'select' ? (
                  <select
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-shadow ${validationErrors[field.name] ? 'border-red-500' : 'border-gray-300'}`}
                    style={{ borderRadius: theme?.borderRadius }}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    value={formData[field.name] || ''}
                  >
                    <option value="" disabled>Select an option</option>
                    {field.options?.map((opt: string, idx: number) => (
                      <option key={idx} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : field.type === 'image' ? (
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-gray-50 transition-colors" style={{ borderColor: validationErrors[field.name] ? 'red' : '#e5e7eb' }}>
                    {formData[field.name] ? (
                      <div className="relative inline-block">
                        <img src={formData[field.name]} alt="Uploaded" className="max-h-48 rounded shadow-sm" />
                        <button 
                          type="button"
                          onClick={() => handleChange(field.name, '')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <div className="w-4 h-4 flex items-center justify-center">×</div>
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <span className="mt-2 block text-sm font-medium text-gray-600">
                          {uploading ? 'Uploading...' : 'Click to upload image'}
                        </span>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, field.name)} disabled={uploading} />
                      </label>
                    )}
                  </div>
                ) : (
                  <input
                    type={field.type}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-shadow ${validationErrors[field.name] ? 'border-red-500' : 'border-gray-300'}`}
                    style={{ borderRadius: theme?.borderRadius }}
                    placeholder={field.placeholder}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    value={formData[field.name] || ''}
                  />
                )}
                
                {validationErrors[field.name] && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle size={12} className="mr-1" /> {validationErrors[field.name]}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-6 border-t border-gray-100">
            {currentPage > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium flex items-center"
              >
                <ChevronLeft size={20} className="mr-1" /> Back
              </button>
            ) : <div></div>}

            {currentPage < totalPages ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-8 py-3 text-white rounded-lg shadow-md hover:opacity-90 transition-all flex items-center font-bold"
                style={{ backgroundColor: theme?.primaryColor, borderRadius: theme?.borderRadius }}
              >
                Next <ChevronRight size={20} className="ml-1" />
              </button>
            ) : (
              <button
                type="submit"
                className="px-8 py-3 text-white rounded-lg shadow-md hover:opacity-90 transition-all font-bold"
                style={{ backgroundColor: theme?.primaryColor, borderRadius: theme?.borderRadius }}
              >
                {form.submitButtonText || 'Submit'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublicForm;
