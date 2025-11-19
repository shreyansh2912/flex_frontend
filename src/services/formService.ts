import axios from 'axios';
const BASE_URL = import.meta.env.VITE_BASE_URL;

const API_URL = `${BASE_URL}/api/form`;
const FORM_DATA_API_URL = `${BASE_URL}/api/form-data`;

const createForm = async (formData: any, token: string) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.post(API_URL, formData, config);
  return response.data;
};

const getForms = async (token: string) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(API_URL, config);
  return response.data;
};

const getFormById = async (id: string, token: string) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${API_URL}/${id}`, config);
  return response.data;
};

const submitForm = async (id: string, formData: any, token: string) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.post(FORM_DATA_API_URL, { formId: id, data: formData }, config);
  return response.data;
};

const getSubmissions = async (formId: string, token: string) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${FORM_DATA_API_URL}/${formId}`, config);
  return response.data;
};

const shareForm = async (formId: string, email: Array<string>, token: string)=>{
  return `Form Shared ${formId} to ${email} with token ${token}`;
}


const getFormSubmissions = async (formId: string, token: string) => {
  return `Form Submissions ${formId} with token ${token}`;
}

const formService = {
  createForm,
  getForms,
  getFormById,
  submitForm,
  getSubmissions,
  shareForm,
  getFormSubmissions
};

export default formService;
