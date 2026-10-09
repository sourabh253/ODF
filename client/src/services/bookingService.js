import axios from 'axios';
import BASE_URL from '../config';

const API_URL = BASE_URL + '/api/bookings/';

const authConfig = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

const bookingService = {
  createBooking: (bookingData, token) =>
    axios.post(API_URL, bookingData, authConfig(token)).then(res => res.data),

  getMyBookings: (token) =>
    axios.get(API_URL + 'mine', authConfig(token)).then(res => res.data),

  updateStatus: (bookingId, status, token) =>
    axios.patch(API_URL + `${bookingId}/status`, { status }, authConfig(token)).then(res => res.data),

  startBooking: (bookingId, token) =>
    axios.patch(API_URL + `${bookingId}/start`, {}, authConfig(token)).then(res => res.data),

  completeWork: (bookingId, token) =>
    axios.patch(API_URL + `${bookingId}/complete`, {}, authConfig(token)).then(res => res.data),

  confirmCompletion: (bookingId, token) =>
    axios.patch(API_URL + `${bookingId}/confirm`, {}, authConfig(token)).then(res => res.data),

  cancelBooking: (bookingId, token) =>
    axios.patch(API_URL + `${bookingId}/cancel`, {}, authConfig(token)).then(res => res.data),

  setPaymentMode: (bookingId, paymentMode, token) =>
    axios.patch(API_URL + `${bookingId}/payment-mode`, { paymentMode }, authConfig(token)).then(res => res.data),
};

export default bookingService;
