import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import formService from '../services/formService';
import { useAuth } from '../context/AuthContext';
import FormPreview from '../components/FormPreview';
import { Trash2, Plus, ArrowRight, Save, Lock, Globe, ArrowUp, ArrowDown } from 'lucide-react';

import type { FormField } from '../types';

const CreateForm: React.FC = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activePage, setActivePage] = useState(1);

  const [formConfig, setFormConfig] = useState({
    title: '',
    formType: 'single-step',
    visibility: 'public',
    password: '',
    allowedEmails: '',
    collectUserInfo: false,
    fields: [] as FormField[],
    theme: {
      primaryColor: '#3b82f6',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      borderRadius: '4px',
    },
    submitButtonText: 'Submit',
  });

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormConfig(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormConfig(prev => ({ ...prev, [name]: checked }));
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormConfig(prev => ({
      ...prev,
      theme: { ...prev.theme, [name]: value }
    }));
  };

  const addField = () => {
    setFormConfig(prev => ({
      ...prev,
      fields: [...prev.fields, { 
        id: Date.now(), 
        label: 'New Field', 
        name: `field_${Date.now()}`,
        type: 'text',
        placeholder: '',
        validation: { required: false },
        layout: { width: '100%' },
        page: activePage
      }],
    }));
  };

  const updateField = (id: number, updates: Partial<FormField>) => {
    setFormConfig(prev => ({
      ...prev,
      fields: prev.fields.map(f => f.id === id ? { ...f, ...updates } : f)
    }));
  };

  const removeField = (id: number) => {
    setFormConfig(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f.id !== id)
    }));
  };

  const moveField = (id: number, direction: 'up' | 'down') => {
    setFormConfig(prev => {
      const fields = [...prev.fields];
      const index = fields.findIndex(f => f.id === id);
      if (index === -1) return prev;

      // Find adjacent field on the SAME page
      const currentField = fields[index];
      let targetIndex = -1;

      if (direction === 'up') {
        for (let i = index - 1; i >= 0; i--) {
          if ((fields[i].page || 1) === (currentField.page || 1)) {
            targetIndex = i;
            break;
          }
        }
      } else {
        for (let i = index + 1; i < fields.length; i++) {
          if ((fields[i].page || 1) === (currentField.page || 1)) {
            targetIndex = i;
            break;
          }
        }
      }

      if (targetIndex !== -1) {
        // Swap
        [fields[index], fields[targetIndex]] = [fields[targetIndex], fields[index]];
      }

      return { ...prev, fields };
    });
  };

  const addNewPage = () => {
    const maxPage = Math.max(...formConfig.fields.map(f => f.page || 1), 1);
    setActivePage(maxPage + 1);
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleFinalSubmit = async () => {
    if (!token || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...formConfig,
        allowedEmails: formConfig.allowedEmails.split(',').map(e => e.trim()).filter(e => e),
        fields: formConfig.fields.map((f, index) => ({ ...f, sequence: index + 1, page: f.page || 1 }))
      };
      
      const newForm = await formService.createForm(payload, token);
      navigate(formConfig.visibility === 'password-protected' ? '/forms' : `/form/${newForm.data._id}/share`);
    } catch (err: any) {
      if (err.response?.data?.message === 'Invalid token') logout();
      else setError('Failed to create form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get unique pages
  const pages = Array.from(new Set(formConfig.fields.map(f => f.page || 1))).sort((a, b) => a - b);
  if (pages.length === 0) pages.push(1);
  if (!pages.includes(activePage)) pages.push(activePage);
  pages.sort((a, b) => a - b);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Create New Form</h1>
        <div className="flex items-center space-x-2 text-sm">
          <span className={`px-3 py-1 rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>1. Basics</span>
          <div className="w-4 h-0.5 bg-gray-300"></div>
          <span className={`px-3 py-1 rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>2. Fields</span>
          <div className="w-4 h-0.5 bg-gray-300"></div>
          <span className={`px-3 py-1 rounded-full ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>3. Theme</span>
          <div className="w-4 h-0.5 bg-gray-300"></div>
          <span className={`px-3 py-1 rounded-full ${step >= 4 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>4. Settings</span>
        </div>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-6">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Controls */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          
          {/* Step 1: Basics */}
          {step === 1 && (
            <div className="space-y-4 text-black">
              <h2 className="text-xl font-semibold mb-4">Form Details</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Form Title</label>
                <input type="text" name="title" value={formConfig.title} onChange={handleConfigChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g., Customer Feedback" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Form Type</label>
                <div className="flex space-x-4">
                  <label className="flex items-center cursor-pointer p-2 border rounded hover:bg-gray-50 w-full">
                    <input type="radio" name="formType" value="single-step" checked={formConfig.formType === 'single-step'} onChange={handleConfigChange} className="mr-2" />
                    Single Step
                  </label>
                  <label className="flex items-center cursor-pointer p-2 border rounded hover:bg-gray-50 w-full">
                    <input type="radio" name="formType" value="multi-step" checked={formConfig.formType === 'multi-step'} onChange={handleConfigChange} className="mr-2" />
                    Multi Step
                  </label>
                </div>
              </div>
              <div className="pt-4">
                <button onClick={nextStep} disabled={!formConfig.title} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2">
                  Next Step <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 text-black">
              <h2 className="text-xl font-semibold mb-4">Build Your Form</h2>
              
              {formConfig.formType === 'multi-step' && (
                <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
                  {pages.map(p => (
                    <button 
                      key={p} 
                      onClick={() => setActivePage(p)}
                      className={`px-3 py-1 rounded text-sm whitespace-nowrap ${activePage === p ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      Page {p}
                    </button>
                  ))}
                  <button onClick={addNewPage} className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600" title="Add Page">
                    <Plus size={16} />
                  </button>
                </div>
              )}

              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {formConfig.fields.filter(f => (f.page || 1) === activePage).map((field, idx, arr) => (
                  <div key={field.id} className="p-4 border rounded-lg bg-gray-50 relative group">
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <button 
                        onClick={() => moveField(field.id, 'up')} 
                        disabled={idx === 0}
                        className="text-gray-400 hover:text-blue-500 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button 
                        onClick={() => moveField(field.id, 'down')} 
                        disabled={idx === arr.length - 1}
                        className="text-gray-400 hover:text-blue-500 disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown size={16} />
                      </button>
                      <button onClick={() => removeField(field.id)} className="text-gray-400 hover:text-red-500 ml-2" title="Remove">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="mb-2 pr-16">
                      <label className="text-xs font-bold text-gray-500 uppercase">Label</label>
                      <input 
                        type="text" 
                        value={field.label} 
                        onChange={(e) => updateField(field.id, { label: e.target.value })} 
                        className="w-full p-1 border rounded text-sm" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Type</label>
                        <select 
                          value={field.type} 
                          onChange={(e) => updateField(field.id, { type: e.target.value as any })} 
                          className="w-full p-1 border rounded text-sm"
                        >
                          <option value="text">Text</option>
                          <option value="email">Email</option>
                          <option value="number">Number</option>
                          <option value="textarea">Textarea</option>
                          <option value="select">Select</option>
                          <option value="date">Date</option>
                          <option value="image">Image Upload</option>
                        </select>
                      </div>
                      <div>
                         <label className="text-xs font-bold text-gray-500 uppercase">Required</label>
                         <div className="flex items-center h-full">
                           <input 
                             type="checkbox" 
                             checked={field.validation?.required} 
                             onChange={(e) => updateField(field.id, { validation: { ...field.validation, required: e.target.checked } })} 
                             className="mr-2"
                           />
                           <span className="text-sm">Yes</span>
                         </div>
                      </div>
                    </div>
                    {field.type !== 'image' && (
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Placeholder</label>
                        <input 
                          type="text" 
                          value={field.placeholder || ''} 
                          onChange={(e) => updateField(field.id, { placeholder: e.target.value })} 
                          className="w-full p-1 border rounded text-sm" 
                          placeholder="Enter placeholder..."
                        />
                      </div>
                    )}
                    {(field.type === 'select' || field.type === 'radio') && (
                       <div className="mt-2">
                         <label className="text-xs font-bold text-gray-500 uppercase">Options (comma separated)</label>
                         <input 
                           type="text" 
                           value={field.options?.join(',') || ''} 
                           onChange={(e) => updateField(field.id, { options: e.target.value.split(',') })} 
                           className="w-full p-1 border rounded text-sm" 
                           placeholder="Option 1, Option 2..."
                         />
                       </div>
                    )}

                    
                    {/* Conditional Logic Builder */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 mb-2">
                        Conditional Logic
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <select
                          value={field.logic?.action || ''}
                          onChange={(e) => updateField(field.id, { logic: { when: '', equals: '', ...field.logic, action: e.target.value as 'show' | 'hide' } })}
                          className="w-full p-1 border rounded text-sm"
                        >
                          <option value="">No Logic</option>
                          <option value="show">Show this field if...</option>
                          <option value="hide">Hide this field if...</option>
                        </select>
                        
                        {field.logic?.action && (
                          <>
                            <select
                              value={field.logic?.when || ''}
                              onChange={(e) => updateField(field.id, { logic: { action: 'show', equals: '', ...field.logic, when: e.target.value } })}
                              className="w-full p-1 border rounded text-sm"
                            >
                              <option value="">Select Field</option>
                              {formConfig.fields
                                .filter(f => f.id !== field.id && f.page === field.page) // Only allow fields on same page or previous (simplified to same page for now)
                                .map(f => (
                                  <option key={f.id} value={f.name}>{f.label}</option>
                                ))
                              }
                            </select>
                            <input
                              type="text"
                              value={field.logic?.equals || ''}
                              onChange={(e) => updateField(field.id, { logic: { action: 'show', when: '', ...field.logic, equals: e.target.value } })}
                              className="w-full p-1 border rounded text-sm"
                              placeholder="Value equals..."
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={addField} className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded hover:border-blue-500 hover:text-blue-500 flex justify-center items-center gap-2">
                <Plus size={16} /> Add Field to Page {activePage}
              </button>
              <div className="flex gap-2 pt-4">
                <button onClick={prevStep} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200">Back</button>
                <button onClick={nextStep} disabled={formConfig.fields.length === 0} className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">Next</button>
              </div>
            </div>
          )}

          {/* Step 3: Theme & Layout */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Design & Layout</h2>
              
              <div className="space-y-4 mb-6">
                <h3 className="font-medium text-gray-700">Theme Colors</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500">Primary Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" name="primaryColor" value={formConfig.theme.primaryColor} onChange={handleThemeChange} className="h-8 w-8 rounded cursor-pointer" />
                      <span className="text-xs">{formConfig.theme.primaryColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Background</label>
                    <div className="flex items-center gap-2">
                      <input type="color" name="backgroundColor" value={formConfig.theme.backgroundColor} onChange={handleThemeChange} className="h-8 w-8 rounded cursor-pointer" />
                      <span className="text-xs">{formConfig.theme.backgroundColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Text Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" name="textColor" value={formConfig.theme.textColor} onChange={handleThemeChange} className="h-8 w-8 rounded cursor-pointer" />
                      <span className="text-xs">{formConfig.theme.textColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Border Radius</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="range" 
                        name="borderRadius" 
                        min="0" 
                        max="20" 
                        value={parseInt(formConfig.theme.borderRadius)} 
                        onChange={(e) => handleThemeChange({ target: { name: 'borderRadius', value: `${e.target.value}px` } } as any)} 
                        className="w-full" 
                      />
                      <span className="text-xs">{formConfig.theme.borderRadius}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-gray-700">Field Layout</h3>
                <div className="max-h-[40vh] overflow-y-auto pr-2 space-y-2">
                  {formConfig.fields.map((field) => (
                    <div key={field.id} className="flex items-center justify-between p-2 border rounded bg-gray-50">
                      <span className="text-sm truncate w-1/2">{field.label} (Page {field.page || 1})</span>
                      <select 
                        value={field.layout?.width || '100%'} 
                        onChange={(e) => updateField(field.id, { layout: { width: e.target.value } })}
                        className="text-xs p-1 border rounded"
                      >
                        <option value="100%">Full Width</option>
                        <option value="50%">50% Width</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button onClick={prevStep} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200">Back</button>
                <button onClick={nextStep} className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Next</button>
              </div>
            </div>
          )}

          {/* Step 4: Settings */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Form Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
                  <div className="space-y-2">
                    <label className={`flex items-center p-3 border rounded cursor-pointer ${formConfig.visibility === 'public' ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}>
                      <input type="radio" name="visibility" value="public" checked={formConfig.visibility === 'public'} onChange={handleConfigChange} className="mr-3" />
                      <Globe size={20} className="mr-2 text-gray-500" />
                      <div>
                        <div className="font-medium">Public</div>
                        <div className="text-xs text-gray-500">Anyone with the link can access</div>
                      </div>
                    </label>
                    <label className={`flex items-center p-3 border rounded cursor-pointer ${formConfig.visibility === 'password-protected' ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}>
                      <input type="radio" name="visibility" value="password-protected" checked={formConfig.visibility === 'password-protected'} onChange={handleConfigChange} className="mr-3" />
                      <Lock size={20} className="mr-2 text-gray-500" />
                      <div>
                        <div className="font-medium">Password Protected</div>
                        <div className="text-xs text-gray-500">Only users with password can access</div>
                      </div>
                    </label>
                  </div>
                </div>

                {formConfig.visibility === 'password-protected' && (
                  <div className="pl-8 space-y-4 border-l-2 border-gray-200 ml-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Set Password</label>
                      <input 
                        type="text" 
                        name="password" 
                        value={formConfig.password} 
                        onChange={handleConfigChange} 
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                        placeholder="Enter a secure password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Invite Users (Email)</label>
                      <p className="text-xs text-gray-500 mb-1">Enter email addresses separated by commas. They will receive the link and password.</p>
                      <textarea 
                        name="allowedEmails" 
                        value={formConfig.allowedEmails} 
                        onChange={handleConfigChange} 
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none h-24" 
                        placeholder="user1@example.com, user2@example.com"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="collectUserInfo" 
                      checked={formConfig.collectUserInfo} 
                      onChange={handleCheckboxChange} 
                      className="mr-3 h-5 w-5 text-blue-600" 
                    />
                    <div>
                      <div className="font-medium">Require Login</div>
                      <div className="text-xs text-gray-500">Respondents must log in to fill the form (Collects Name & Email)</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-6">
                <button onClick={prevStep} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200">Back</button>
                <button onClick={handleFinalSubmit} className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 flex justify-center items-center gap-2">
                  <Save size={16} /> {isSubmitting ? 'Creating Form...' : 'Create Form'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Preview */}
        <div className="lg:col-span-2">
          <div className="sticky top-6">
            <div className="bg-gray-100 rounded-xl p-4 mb-2 flex justify-between items-center">
              <h3 className="font-bold text-gray-500 uppercase text-sm">Live Preview</h3>
              <div className="text-xs text-gray-400">Updates automatically</div>
            </div>
            <FormPreview formConfig={{...formConfig, fields: formConfig.fields.filter(f => (f.page || 1) === activePage)}} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateForm;