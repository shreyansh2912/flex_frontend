import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import formService from '../services/formService';
import { useAuth } from '../context/AuthContext';

interface FormField {
  id: number;
  label: string;
  type: 'text' | 'email' | 'number' | 'date';
  // 'validations' and 'sequence' can be added here later
}

const CreateForm: React.FC = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State to hold all form data across steps
  const [formConfig, setFormConfig] = useState({
    title: '',
    formType: '',
    visibility: 'public',
    fields: [{ id: Date.now(), label: '', type: 'text' }] as FormField[],
    submitButtonText: 'Submit',
  });

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleFieldChange = (id: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormConfig(prev => ({
      ...prev,
      fields: prev.fields.map(field =>
        field.id === id ? { ...field, [name]: value } : field
      ),
    }));
  };

  const addField = () => {
    setFormConfig(prev => ({
      ...prev,
      fields: [...prev.fields, { id: Date.now(), label: '', type: 'text' }],
    }));
  };

  const removeField = (id: number) => {
    setFormConfig(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== id),
    }));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleFinalSubmit = async () => {
    if (!token || isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      // The backend will need to be updated to accept `fields` and `submitButtonText`
      const newForm = await formService.createForm(formConfig, token);
      
      if (formConfig.visibility === 'shared') {
        navigate(`/form/${newForm.data._id}/share`);
      } else {
        navigate('/forms');
      }
    } catch (err: any) {
      if (err.response?.data?.message === 'Invalid token') {
        logout();
      } else {
        setError('Failed to create form. Please try again.');
        setStep(1); // Go back to the first step on error
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <h1 className="text-3xl font-bold mb-2">Create New Form</h1>
      <p className="text-gray-500 mb-6">Step {step} of 2</p>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-700 font-bold mb-2">Form Title</label>
            <input type="text" id="title" name="title" value={formConfig.title} onChange={handleConfigChange} className="input-style" required />
          </div>
          <div className="mb-6">
            <label htmlFor="formType" className="block text-gray-700 font-bold mb-2">Form Type</label>
            <input type="text" id="formType" name="formType" value={formConfig.formType} onChange={handleConfigChange} className="input-style" placeholder="e.g., Contact, Survey, Registration" required />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2">Visibility</label>
            <div className="flex items-center">
              {['public', 'private', 'shared'].map(v => (
                <React.Fragment key={v}>
                  <input type="radio" id={v} name="visibility" value={v} checked={formConfig.visibility === v} onChange={handleConfigChange} className="mr-2" />
                  <label htmlFor={v} className="mr-4 capitalize">{v}</label>
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="flex justify-end mt-8">
            <button onClick={nextStep} disabled={!formConfig.title} className="btn-primary">Next</button>
          </div>
        </div>
      )}

      {/* Step 2: Form Builder */}
      {step === 2 && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Define Form Fields</h3>
          {formConfig.fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-4 p-4 border rounded-md">
              <div className="md:col-span-2">
                <label htmlFor={`label-${field.id}`} className="block text-sm font-medium text-gray-700">Field Label</label>
                <input type="text" id={`label-${field.id}`} name="label" value={field.label} onChange={(e) => handleFieldChange(field.id, e)} className="input-style mt-1" placeholder={`Field ${index + 1}`} />
              </div>
              <div>
                <label htmlFor={`type-${field.id}`} className="block text-sm font-medium text-gray-700">Field Type</label>
                <select id={`type-${field.id}`} name="type" value={field.type} onChange={(e) => handleFieldChange(field.id, e)} className="input-style mt-1">
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                </select>
              </div>
              {formConfig.fields.length > 1 && (
                <div className="md:col-span-3 flex justify-end">
                  <button onClick={() => removeField(field.id)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                </div>
              )}
            </div>
          ))}
          <button onClick={addField} className="btn-secondary mb-6">+ Add Field</button>

          <div className="mt-6 border-t pt-6">
            <label htmlFor="submitButtonText" className="block text-gray-700 font-bold mb-2">Submit Button Text</label>
            <input type="text" id="submitButtonText" name="submitButtonText" value={formConfig.submitButtonText} onChange={handleConfigChange} className="input-style" />
          </div>

          <div className="flex justify-between mt-8">
            <button onClick={prevStep} className="btn-secondary">Back</button>
            <button onClick={handleFinalSubmit} disabled={isSubmitting || formConfig.fields.some(f => !f.label)} className="btn-primary">
              {isSubmitting ? 'Creating...' : 'Create Form'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateForm;

// Helper CSS classes to be added to your main CSS file (e.g., App.css or index.css)
/*
.input-style {
  @apply shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline;
}
.btn-primary {
  @apply bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-blue-300;
}
.btn-secondary {
  @apply bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline;
}
*/