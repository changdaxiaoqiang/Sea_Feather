import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

api.interceptors.response.use(
  response => response.data,
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const getActivities = (params) => api.get('/activities', { params });
export const getActivity = (id) => api.get(`/activities/${id}`);
export const registerActivity = (id, data) => api.post(`/activities/${id}/register`, data);

export const getMyRegistrations = (openid) => api.get('/registrations', { params: { openid } });
export const cancelRegistration = (id, openid) => api.post(`/registrations/${id}/cancel`, { openid });

export const getMemberProfile = (openid) => api.get('/member/profile', { params: { openid } });
export const updateMemberProfile = (data) => api.post('/member/profile', data);
export const getMemberPoints = (openid) => api.get('/member/points', { params: { openid } });
export const getPointsRecords = (openid, params) => api.get('/member/points/records', { params: { openid, ...params } });
export const getBalanceRecords = (openid, params) => api.get('/member/balance/records', { params: { openid, ...params } });

export const getProducts = (params) => api.get('/products', { params });
export const getProduct = (id) => api.get(`/products/${id}`);
export const redeemProduct = (id, openid) => api.post(`/products/${id}/redeem`, { openid });

export const getAdminActivities = () => api.get('/admin/activities');
export const createActivity = (data) => api.post('/admin/activities', data);
export const updateActivity = (id, data) => api.put(`/admin/activities/${id}`, data);
export const deleteActivity = (id) => api.delete(`/admin/activities/${id}`);
export const calculateActivity = (id) => api.post(`/admin/activities/${id}/calculate`);
export const getActivitySummary = (id) => api.post(`/admin/activities/${id}/summary`);
export const getActivityRegistrations = (id, params) => api.get(`/admin/activities/${id}/registrations`, { params });

export const markRegistrationPaid = (id, isPaid, paymentMethod, useBalance) => api.post(`/admin/registrations/${id}/paid`, { is_paid: isPaid, payment_method: paymentMethod, use_balance: useBalance });
export const markAllPaid = (id) => api.post(`/admin/registrations/${id}/pay-all`);

export const getAdminMembers = (params) => api.get('/admin/members', { params });
export const updateMember = (id, data) => api.put(`/admin/members/${id}`, data);
export const adjustMemberPoints = (id, data) => api.post(`/admin/members/${id}/points`, data);
export const rechargeBalance = (id, data) => api.post(`/admin/members/${id}/balance`, data);
export const rechargeMember = (id, data) => api.post(`/admin/members/${id}/member`, data);

export const getAdminProducts = () => api.get('/admin/products');
export const createProduct = (data) => api.post('/admin/products', data);
export const updateProduct = (id, data) => api.put(`/admin/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/admin/products/${id}`);

export const getRedemptions = () => api.get('/admin/redemptions');

export const getSystemUsers = () => api.get('/system/users');
export const createSystemUser = (data) => api.post('/system/users', data);
export const updateSystemUser = (id, data) => api.put(`/system/users/${id}`, data);
export const deleteSystemUser = (id) => api.delete(`/system/users/${id}`);
export const getSystemPermissions = () => api.get('/system/permissions');
export const systemLogin = (data) => api.post('/system/login', data);

export const uploadImage = (formData) => {
  return axios.post(`${API_BASE}/admin/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => res.data);
};

export default api;