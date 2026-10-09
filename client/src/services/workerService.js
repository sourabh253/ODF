import axios from 'axios';
import BASE_URL from '../config';

const API_URL = BASE_URL + '/api/worker/';

const getAuthHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

const completeProfile = async (profileData, token) => {
  const response = await axios.post(API_URL + 'profile', profileData, getAuthHeader(token));
  return response.data;
};

const getMyProfile = async (token) => {
  const response = await axios.get(API_URL + 'profile', getAuthHeader(token));
  return response.data;
};

const updateProfile = async (profileData, token) => {
  const response = await axios.put(API_URL + 'profile', profileData, getAuthHeader(token));
  return response.data;
};

const updateAvailability = async (isAvailable, token) => {
  const response = await axios.put(API_URL + 'availability', { isAvailable }, getAuthHeader(token));
  return response.data;
};

const uploadFile = async (file, token) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post(
    BASE_URL + '/api/upload',
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

const workerService = {
  completeProfile,
  getMyProfile,
  updateProfile,
  updateAvailability,
  uploadFile,
};

export default workerService;
