import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/api/catalog/';

const getAuthHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

const catalogService = {
  getMainCategories: (token) =>
    axios.get(API_URL + 'main-categories', getAuthHeader(token)).then(res => res.data),

  getCategories: (token, mainCategory) => {
    const params = mainCategory ? { mainCategory } : {};
    return axios.get(API_URL + 'categories', { ...getAuthHeader(token), params }).then(res => res.data);
  },

  getSubCategories: (category, token, mainCategory) => {
    const params = mainCategory ? { mainCategory } : {};
    return axios.get(API_URL + `${encodeURIComponent(category)}/subcategories`, {
      ...getAuthHeader(token), params,
    }).then(res => res.data);
  },

  getServices: (category, subCategory, token, mainCategory) => {
    const params = {};
    if (subCategory) params.subCategory = subCategory;
    if (mainCategory) params.mainCategory = mainCategory;
    return axios.get(API_URL + `${encodeURIComponent(category)}/services`, {
      ...getAuthHeader(token), params,
    }).then(res => res.data);
  },

  getCatalogTree: (token, mainCategory) => {
    const params = mainCategory ? { mainCategory } : {};
    return axios.get(API_URL + 'tree', { ...getAuthHeader(token), params }).then(res => res.data);
  },

  searchServices: (token, query, mainCategory) => {
    const params = {};
    if (query) params.q = query;
    if (mainCategory) params.mainCategory = mainCategory;
    return axios.get(API_URL + 'search', { ...getAuthHeader(token), params }).then(res => res.data);
  },

  getServiceById: (serviceId, token) =>
    axios.get(API_URL + `service/${serviceId}`, getAuthHeader(token)).then(res => res.data),
};

export default catalogService;
