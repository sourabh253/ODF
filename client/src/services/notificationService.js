import axios from 'axios';
import BASE_URL from '../config';

const API_URL = BASE_URL + '/api/notifications/';

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
