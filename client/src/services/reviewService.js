import axios from 'axios';
import BASE_URL from '../config';

const API_URL = BASE_URL + '/api/reviews/';

const authConfig = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

const reviewService = {
  submitReview: (data, token) =>
    axios.post(API_URL, data, authConfig(token)).then(res => res.data),

  getWorkerReviews: (workerId, token) =>
    axios.get(API_URL + `worker/${workerId}`, authConfig(token)).then(res => res.data),

  getAllReviews: (token) =>
    axios.get(API_URL + 'admin/all', authConfig(token)).then(res => res.data),
};

export default reviewService;
