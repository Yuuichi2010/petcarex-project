import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add token if exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || 'An error occurred';
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

// ===== DASHBOARD =====
export const getDashboardStats = () => api.get('/dashboard/stats');
export const getRecentAppointments = () => api.get('/dashboard/appointments');
export const getRevenueByBranch = () => api.get('/dashboard/revenue-by-branch');

// ===== CUSTOMERS =====
export const getCustomers = (params) => api.get('/customers', { params });
export const getCustomerById = (id) => api.get(`/customers/${id}`);
export const createCustomer = (data) => api.post('/customers', data);
export const updateCustomer = (id, data) => api.put(`/customers/${id}`, data);
export const deleteCustomer = (id) => api.delete(`/customers/${id}`);


// ===== PETS =====
export const getPets = (params) => api.get('/pets', { params });
export const getPetById = (id) => api.get(`/pets/${id}`);
export const getPetMedicalHistory = (id) => api.get(`/pets/${id}/medical-history`);
export const getPetVaccinationHistory = (id) => api.get(`/pets/${id}/vaccination-history`);
export const createPet = (data) => api.post('/pets', data);
export const updatePet = (id, data) => api.put(`/pets/${id}`, data);
export const deletePet = (id) => api.delete(`/pets/${id}`);
export const getPetInvoices = (id) => api.get(`/pets/${id}/invoices`);

// ===== BRANCHES =====
export const getBranches = () => api.get('/branches');
export const getBranchById = (id) => api.get(`/branches/${id}`);
export const getBranchRevenue = (id, params) => api.get(`/branches/${id}/revenue`, { params });
export const createBranch = (data) => api.post('/branches', data);
export const updateBranch = (id, data) => api.put(`/branches/${id}`, data);

// ===== INVOICES =====
export const getInvoices = (params) => api.get('/invoices', { params });
export const getInvoiceById = (id) => api.get(`/invoices/${id}`);
export const createInvoice = (data) => api.post('/invoices', data);

// ===== VACCINES =====
export const getVaccines = (params) => api.get('/vaccines', { params });
export const searchVaccines = (params) => api.get('/vaccines/search', { params });
export const getPopularVaccines = (params) => api.get('/vaccines/popular', { params });
export const createVaccine = (data) => api.post('/vaccines', data);
export const updateVaccine = (id, data) => api.put(`/vaccines/${id}`, data);

// ===== PRODUCTS =====
export const getProducts = (params) => api.get('/products', { params });
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// ===== STAFF =====
export const getStaff = (params) => api.get('/staff', { params });
export const getStaffById = (id) => api.get(`/staff/${id}`);
export const getStaffPerformance = (params) => api.get('/staff/performance', { params });
export const createStaff = (data) => api.post('/staff', data);
export const updateStaff = (id, data) => api.put(`/staff/${id}`, data);
export const updateStaffSalary = (id, data) => api.put(`/staff/${id}/salary`, data);
export const transferStaff = (id, data) => api.put(`/staff/${id}/transfer`, data);
export const deleteStaff = (id) => api.delete(`/staff/${id}`);

// ===== REPORTS =====
export const getSystemRevenue = (params) => api.get('/reports/system-revenue', { params });
export const getTopServices = (params) => api.get('/reports/top-services', { params });
export const getPetStatistics = () => api.get('/reports/pet-statistics');
export const getMembershipStatus = () => api.get('/reports/membership-status');
export const getBranchCustomers = (branchId) => api.get(`/reports/branch-customers/${branchId}`);
export const getVaccinatedPets = (params) => api.get('/reports/vaccinated-pets', { params });
export const getInventory = (params) => api.get('/reports/inventory', { params });

// ===== NOTIFICATIONS =====
export const getNotifications = (params) => api.get('/notifications', { params });
export const getUnreadNotifications = () => api.get('/notifications/unread');
export const markNotificationAsRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllNotificationsAsRead = () => api.put('/notifications/read-all');
export const createNotification = (data) => api.post('/notifications', data);
export const deleteNotification = (id) => api.delete(`/notifications/${id}`);
export const deleteAllReadNotifications = () => api.delete('/notifications/read/all');

// ===== SETTINGS =====
export const getSettings = (params) => api.get('/settings', { params });
export const getSettingByName = (name) => api.get(`/settings/${name}`);
export const updateSetting = (name, data) => api.put(`/settings/${name}`, data);
export const updateMultipleSettings = (data) => api.put('/settings/bulk/update', data);
export const resetSettings = () => api.post('/settings/reset');
export const getActivityLog = (params) => api.get('/activity-log', { params });

export default api;
