import axios from 'axios';
import BASE_URL from '../config';

const API_URL = BASE_URL + '/api/customers/';
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
