import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/api/auth/';

const registerCustomer = async (userData) => {
  const response = await axios.post(API_URL + 'customer/register', userData);
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const loginCustomer = async (userData) => {
  const response = await axios.post(API_URL + 'customer/login', userData);
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const registerWorker = async (userData) => {
  const response = await axios.post(API_URL + 'worker/register', userData);
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const loginWorker = async (userData) => {
  const response = await axios.post(API_URL + 'worker/login', userData);
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem('user');
};

const getMe = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(API_URL + 'me', config);
  return response.data;
};

const authService = {
  registerCustomer,
  loginCustomer,
  registerWorker,
  loginWorker,
  logout,
  getMe,
};

export default authService;
