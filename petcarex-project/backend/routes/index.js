const express = require('express');
const router = express.Router();

// Import controllers
const dashboardController = require('../controllers/dashboardController');
const customerController = require('../controllers/customerController');
const petController = require('../controllers/petController');
const branchController = require('../controllers/branchController');
const invoiceController = require('../controllers/invoiceController');
const vaccineController = require('../controllers/vaccineController');
const staffController = require('../controllers/staffController');
const reportController = require('../controllers/reportController');
const productController = require('../controllers/productController');
const notificationController = require('../controllers/notificationController');
const settingsController = require('../controllers/settingsController');

// ===== DASHBOARD =====
router.get('/dashboard/stats', dashboardController.getStats);
router.get('/dashboard/appointments', dashboardController.getRecentAppointments);
router.get('/dashboard/revenue-by-branch', dashboardController.getRevenueByBranch);

// ===== CUSTOMERS =====
router.get('/customers', customerController.getAllCustomers);
router.get('/customers/:id', customerController.getCustomerById);
router.post('/customers', customerController.createCustomer);
router.put('/customers/:id', customerController.updateCustomer);
router.delete('/customers/:id', customerController.deleteCustomer);
router.get('/customers/:id/recent-invoices', customerController.getCustomerRecentInvoices);
router.get('/customers/:id/spending-stats', customerController.getCustomerSpendingStats);
router.get('/customers/:id/pets', customerController.getCustomerPets);


// ===== PETS =====
router.get('/pets', petController.getAllPets);
router.get('/pets/:id', petController.getPetById);
router.get('/pets/:id/medical-history', petController.getMedicalHistory);
router.get('/pets/:id/vaccination-history', petController.getVaccinationHistory);
router.get('/pets/:id/invoices', petController.getPetInvoices);
router.post('/pets', petController.createPet);
router.put('/pets/:id', petController.updatePet);
router.delete('/pets/:id', petController.deletePet);


// ===== BRANCHES =====
router.get('/branches', branchController.getAllBranches);
router.get('/branches/:id', branchController.getBranchById);
router.get('/branches/:id/revenue', branchController.getBranchRevenue);
router.post('/branches', branchController.createBranch);
router.put('/branches/:id', branchController.updateBranch);
router.get('/branches/:id/detail-full', branchController.getBranchDetailFull);
router.get('/branches/:id/invoices', branchController.getBranchInvoices);
router.delete('/branches/:id', branchController.deleteBranch);


// ===== INVOICES =====
router.get('/invoices', invoiceController.getAllInvoices);
router.get('/invoices/:id', invoiceController.getInvoiceById);
router.post('/invoices', invoiceController.createInvoice);

// ===== VACCINES =====
router.get('/vaccines', vaccineController.getAllVaccines);
router.get('/vaccines/search', vaccineController.searchVaccines);
router.get('/vaccines/popular', vaccineController.getPopularVaccines);
router.post('/vaccines', vaccineController.createVaccine);
router.put('/vaccines/:id', vaccineController.updateVaccine);

// ===== PRODUCTS =====
router.get('/products', productController.getAllProducts);
router.post('/products', productController.createProduct);
router.put('/products/:id', productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

// ===== STAFF =====
router.get('/staff', staffController.getAllStaff);
router.get('/staff/:id', staffController.getStaffById);
router.get('/staff/performance', staffController.getStaffPerformance);
router.post('/staff', staffController.createStaff);
router.put('/staff/:id', staffController.updateStaff);
router.put('/staff/:id/salary', staffController.updateSalary);
router.put('/staff/:id/transfer', staffController.transferStaff);
router.delete('/staff/:id', staffController.deleteStaff);

// ===== REPORTS =====
router.get('/reports/system-revenue', reportController.getSystemRevenue);
router.get('/reports/top-services', reportController.getTopServices);
router.get('/reports/pet-statistics', reportController.getPetStatistics);
router.get('/reports/membership-status', reportController.getMembershipStatus);
router.get('/reports/branch-customers/:branchId', reportController.getBranchCustomers);
router.get('/reports/vaccinated-pets', reportController.getVaccinatedPets);
router.get('/reports/inventory', reportController.getInventory);

// ===== NOTIFICATIONS =====
router.get('/notifications', notificationController.getAllNotifications);
router.get('/notifications/unread', notificationController.getUnreadNotifications);
router.put('/notifications/:id/read', notificationController.markAsRead);
router.put('/notifications/read-all', notificationController.markAllAsRead);
router.post('/notifications', notificationController.createNotification);
router.delete('/notifications/:id', notificationController.deleteNotification);
router.delete('/notifications/read/all', notificationController.deleteAllRead);

// ===== SETTINGS =====
router.get('/settings', settingsController.getAllSettings);
router.get('/settings/:name', settingsController.getSettingByName);
router.put('/settings/:name', settingsController.updateSetting);
router.put('/settings/bulk/update', settingsController.updateMultipleSettings);
router.post('/settings/reset', settingsController.resetToDefault);
router.get('/activity-log', settingsController.getActivityLog);

module.exports = router;
