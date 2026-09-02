import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/api/customers/';
const authConfig = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

const searchWorkers = async ({ skill, city }, token) => {
  const response = await axios.get(API_URL + 'workers', {
    ...authConfig(token),
    params: { skill, city },
  });
  return response.data;
};

const getWorker = async (workerId, token) => {
  const response = await axios.get(API_URL + `workers/${workerId}`, authConfig(token));
  return response.data;
};

const customerService = { searchWorkers, getWorker };
export default customerService;
