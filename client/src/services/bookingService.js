import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/api/bookings/';

const createBooking = async (bookingData, token) => {
  const response = await axios.post(API_URL, bookingData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const getMyBookings = async (token) => {
  const response = await axios.get(API_URL + 'mine', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const updateStatus = async (bookingId, status, token) => {
  const response = await axios.patch(API_URL + `${bookingId}/status`, { status }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export default { createBooking, getMyBookings, updateStatus };
