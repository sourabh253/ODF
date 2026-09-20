import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/api/admin/';

const getAuthHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

const adminService = {
  getDashboardStats: (token) =>
    axios.get(API_URL + 'dashboard', getAuthHeader(token)).then(res => res.data),

  getCustomers: (token) =>
    axios.get(API_URL + 'customers', getAuthHeader(token)).then(res => res.data),

  getWorkers: (token) =>
    axios.get(API_URL + 'workers', getAuthHeader(token)).then(res => res.data),

  getPendingVerifications: (token) =>
    axios.get(API_URL + 'workers/verifications', getAuthHeader(token)).then(res => res.data),

  updateWorkerVerification: (workerId, verificationStatus, token) =>
    axios.patch(API_URL + `workers/${workerId}/verify`, { verificationStatus }, getAuthHeader(token)).then(res => res.data),

  toggleWorkerStatus: (userId, token) =>
    axios.patch(API_URL + `workers/${userId}/toggle`, {}, getAuthHeader(token)).then(res => res.data),

  getBookings: (token) =>
    axios.get(API_URL + 'bookings', getAuthHeader(token)).then(res => res.data),

  getWallets: (token) =>
    axios.get(API_URL + 'wallets', getAuthHeader(token)).then(res => res.data),

  adjustWallet: (workerUserId, amount, note, token) =>
    axios.post(API_URL + 'wallets/adjust', { workerUserId, amount, note }, getAuthHeader(token)).then(res => res.data),
};

export default adminService;
