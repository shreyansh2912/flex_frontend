import axios from 'axios';
const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5001';

const API_URL = `${BASE_URL}/api/form`;

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

// Public endpoint - no token required for fetching public form details
const getPublicForm = async (id: string) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

// Public endpoint - no token required for submission
const submitResponse = async (id: string, data: any) => {
  const response = await axios.post(`${API_URL}/${id}/submit`, { data });
  return response.data;
};

const getFormSubmissions = async (formId: string, token: string) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${API_URL}/${formId}/submissions`, config);
  return response.data;
};

const deleteForm = async (id: string, token: string) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.delete(`${API_URL}/${id}`, config);
  return response.data;
};

const shareForm = async (id: string, emails: string[], token: string) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.post(`${API_URL}/${id}/share`, { emails }, config);
  return response.data;
};

const formService = {
  createForm,
  getForms,
  getFormById,
  getPublicForm,
  submitResponse,
  getFormSubmissions,
  deleteForm,
  shareForm
};

export default formService;
