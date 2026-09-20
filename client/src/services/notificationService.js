import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/api/notifications/';

const getAuthHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

const notificationService = {
  getNotifications: (token) =>
    axios.get(API_URL, getAuthHeader(token)).then(res => res.data),

  markAsRead: (id, token) =>
    axios.patch(API_URL + `${id}/read`, {}, getAuthHeader(token)).then(res => res.data),

  markAllAsRead: (token) =>
    axios.patch(API_URL + 'read-all', {}, getAuthHeader(token)).then(res => res.data),
};

export default notificationService;
