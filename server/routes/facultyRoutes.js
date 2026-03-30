const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { upload, cloudinaryVideoUpload, cloudinaryMixedUpload, localAssignmentUpload } = require('../middleware/uploadMiddleware');
const contentController = require('../controllers/contentController');
const facultyController = require('../controllers/facultyController');

router.use(protect);
router.use(authorizeRoles('faculty', 'admin'));

// Dashboard
router.get('/dashboard', facultyController.getDashboardStats);

// Subjects & Chapters (read-only for faculty, scoped to their assignments)
router.get('/subjects', facultyController.getAssignedSubjects);
router.get('/subjects/:subjectId/chapters', contentController.getChaptersBySubject);

// Content Upload — using Local Storage for both video and docs (Workaround for Cloudinary 401 error)
router.post('/content/upload', localAssignmentUpload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'assignment', maxCount: 1 }
]), facultyController.uploadContent);

// Live Classes
router.get('/live-classes', facultyController.getLiveClasses);
router.post('/live-classes', facultyController.scheduleLiveClass);
router.get('/batches', facultyController.getBatches);
router.put('/profile', facultyController.updateProfile);

// Students
router.get('/students', facultyController.getStudents);
router.get('/students/:id/metrics', facultyController.getStudentMetrics);
router.post('/profile/request-update', facultyController.createProfileRequest);

// Content Management (CRUD for each type)
router.get('/content/manage/:type', facultyController.getUploadedContent);
router.put('/content/manage/:type/:id', localAssignmentUpload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'assignment', maxCount: 1 }
]), facultyController.updateUploadedContent);
router.delete('/content/manage/:type/:id', facultyController.deleteUploadedContent);

module.exports = router;
