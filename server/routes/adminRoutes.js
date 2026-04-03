const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');
const { uploadImage } = require('../middleware/uploadMiddleware');

router.use(protect);
router.use(authorizeRoles('admin'));

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Admission enquiries (landing form)
router.get('/enquiries', adminController.getAdmissionEnquiries);
router.patch('/enquiries/:id', adminController.updateAdmissionEnquiry);
router.delete('/enquiries/:id', adminController.deleteAdmissionEnquiry);

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
router.get('/batches-by-class', adminController.getBatchesByClass);

// Batch CRUD (used by admin curriculum UI)
router.get('/batches', adminController.getBatches);
router.post('/batches', adminController.createBatch);
router.put('/batches/:id', adminController.updateBatch);
router.delete('/batches/:id', adminController.deleteBatch);

router.delete('/classes/:id', adminController.deleteClass);

// Subject Management
router.get('/subjects', adminController.getSubjects);
router.post('/subjects', adminController.createSubject);
router.put('/subjects/:id', adminController.updateSubject);
router.delete('/subjects/:id', adminController.deleteSubject);

// Activity Log
router.get('/activity-logs', adminController.getActivityLogs);
router.delete('/activity-logs', adminController.clearActivityLogs);

// Profile Requests
router.get('/profile-requests', adminController.getProfileRequests);
router.put('/profile-requests/:id/approve', adminController.approveProfileRequest);
router.put('/profile-requests/:id/reject', adminController.rejectProfileRequest);

// User Details
router.get('/students/:id/details', adminController.getStudentDetails);
router.get('/instructors/:id/details', adminController.getInstructorDetails);

// Settings
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

// WhatsApp control
router.get('/whatsapp/status', adminController.getWhatsAppStatus);
router.post('/whatsapp/logout', adminController.logoutWhatsApp);

// Uploads
router.post('/upload-image', uploadImage.single('image'), adminController.uploadImage);

module.exports = router;
