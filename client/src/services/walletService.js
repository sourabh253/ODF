import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/api/wallet/';

const getAuthHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

const walletService = {
  getWallet: (token) =>
    axios.get(API_URL, getAuthHeader(token)).then(res => res.data),

  getTransactions: (token) =>
    axios.get(API_URL + 'transactions', getAuthHeader(token)).then(res => res.data),

  withdraw: (amount, token) =>
    axios.post(API_URL + 'withdraw', { amount }, getAuthHeader(token)).then(res => res.data),
};

export default walletService;
