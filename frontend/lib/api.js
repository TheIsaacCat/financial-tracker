import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;

// Auth API
export const authAPI = {
  register: (email, password, firstName, lastName) =>
    apiClient.post('/auth/register', { email, password, firstName, lastName }),
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),
  getCurrentUser: () => apiClient.get('/auth/me'),
};

// Plaid API
export const plaidAPI = {
  createLinkToken: () => apiClient.post('/plaid/link-token'),
  exchangeToken: (publicToken) =>
    apiClient.post('/plaid/exchange-token', { publicToken }),
  getAccounts: () => apiClient.get('/plaid/accounts'),
  syncTransactions: () => apiClient.post('/plaid/sync'),
  removeAccount: (accountId) => apiClient.delete(`/plaid/accounts/${accountId}`),
};

// Transaction API
export const transactionAPI = {
  getTransactions: (params) =>
    apiClient.get('/transactions', { params }),
  getTransaction: (id) => apiClient.get(`/transactions/${id}`),
  labelTransaction: (id, label, notes, group) =>
    apiClient.post(`/transactions/${id}/label`, { label, notes, group }),
  getStats: () => apiClient.get('/transactions/stats/summary'),
  getGroups: () => apiClient.get('/transactions/groups'),
};

// Recommendations API
export const recommendationsAPI = {
  getAnalysis: () => apiClient.get('/recommendations/analysis'),
  getRecommendations: () => apiClient.get('/recommendations'),
};

// Statements API
export const statementAPI = {
  getStatements: () => apiClient.get('/statements'),
  getStatement: (month) => apiClient.get(`/statements/${month}`),
};
