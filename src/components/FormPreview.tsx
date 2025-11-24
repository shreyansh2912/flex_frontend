import React from 'react';
import { Upload } from 'lucide-react';

interface FormPreviewProps {
  formConfig: {
    title: string;
    fields: any[];
    theme: {
      primaryColor: string;
      backgroundColor: string;
      textColor: string;
      borderRadius: string;
    };
    submitButtonText: string;
  };
}

const FormPreview: React.FC<FormPreviewProps> = ({ formConfig }) => {
  const { title, fields, theme, submitButtonText } = formConfig;

  const containerStyle = {
    backgroundColor: theme.backgroundColor,
    color: theme.textColor,
    borderRadius: theme.borderRadius,
  };

  const buttonStyle = {
    backgroundColor: theme.primaryColor,
    color: '#fff',
    borderRadius: theme.borderRadius,
  };

  return (
    <div className="p-8 shadow-lg border" style={containerStyle}>
      <h2 className="text-2xl font-bold mb-6" style={{ color: theme.primaryColor }}>{title || 'Untitled Form'}</h2>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-wrap -mx-2">
          {fields.map((field) => (
            <div 
              key={field.id} 
              className="px-2 mb-4" 
              style={{ width: field.layout?.width || '100%' }}
            >
              <label className="block font-medium mb-1">
                {field.label}
                {field.validation?.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {field.type === 'textarea' ? (
                <textarea 
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2"
                  style={{ borderColor: theme.primaryColor, borderRadius: theme.borderRadius }}
                  placeholder={field.placeholder}
                />
              ) : field.type === 'select' ? (
                <select 
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2"
                  style={{ borderColor: theme.primaryColor, borderRadius: theme.borderRadius }}
                >
                  <option value="">Select an option</option>
                  {field.options?.map((opt: string, idx: number) => (
                    <option key={idx} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : field.type === 'image' ? (
                <div className="border-2 border-dashed rounded p-4 text-center text-gray-400">
                  <Upload className="mx-auto mb-2" />
                  <span className="text-sm">Image Upload Preview</span>
                </div>
              ) : (
                <input 
                  type={field.type} 
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2"
                  style={{ borderColor: theme.primaryColor, borderRadius: theme.borderRadius }}
                  placeholder={field.placeholder}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-6">
          <button className="px-6 py-2 font-bold transition-opacity hover:opacity-90" style={buttonStyle}>
            {submitButtonText}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormPreview;
