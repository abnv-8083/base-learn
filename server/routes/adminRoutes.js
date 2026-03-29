const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

router.use(protect);
router.use(authorizeRoles('admin'));

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// User Management
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.patch('/users/:id/status', adminController.toggleUserStatus);
router.get('/faculty/:id/details', adminController.getFacultyDetails);
router.post('/faculty/approve-request/:requestId', adminController.approveProfileRequest);

// Class Management
router.get('/classes', adminController.getClasses);
router.post('/classes', adminController.createClass);
router.put('/classes/:id', adminController.updateClass);
router.get('/classes/:id/details', adminController.getClassDetails);
router.delete('/classes/:id', adminController.deleteClass);

// Activity Log
router.get('/activity-logs', adminController.getActivityLogs);

// Profile Requests
router.get('/profile-requests', adminController.getProfileRequests);
router.put('/profile-requests/:id/approve', adminController.approveProfileRequest);
router.put('/profile-requests/:id/reject', adminController.rejectProfileRequest);

module.exports = router;
