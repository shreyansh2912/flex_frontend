import axios from 'axios';
const BASE_URL = import.meta.env.VITE_BASE_URL;

const API_URL = `${BASE_URL}/api/auth`; // Adjust the URL if needed

const sendOtp = async (email: string) => {
  const response = await axios.post(`${API_URL}/send-otp`, { email });
  return response.data;
};

const verifyOtp = async (email: string, otp: string) => {
  const response = await axios.post(`${API_URL}/verify-otp`, { email, otp });
  return response.data;
};

const authService = {
  sendOtp,
  verifyOtp,
};

export default authService;
