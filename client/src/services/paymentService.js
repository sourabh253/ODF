import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/api/payments/';

const getAuthHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

const paymentService = {
  createOrder: (bookingId, token) =>
    axios.post(API_URL + 'create-order', { bookingId }, getAuthHeader(token)).then(res => res.data),

  verifyPayment: (data, token) =>
    axios.post(API_URL + 'verify', data, getAuthHeader(token)).then(res => res.data),

  validateCoupon: (code, bookingId, token) =>
    axios.post(API_URL + 'coupon/validate', { code, bookingId }, getAuthHeader(token)).then(res => res.data),
};

export default paymentService;
