const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const contentController = require('../controllers/contentController');
const facultyController = require('../controllers/facultyController');

router.use(protect);
router.use(authorizeRoles('faculty', 'admin'));

// Dashboard
router.get('/dashboard', facultyController.getDashboardStats);

// Subjects & Chapters (read-only for faculty, scoped to their assignments)
router.get('/subjects', facultyController.getAssignedSubjects);
router.get('/subjects/:subjectId/chapters', contentController.getChaptersBySubject);

// Content Upload — both video and PDF use 'file' field
router.post('/content/upload', upload.single('file'), facultyController.uploadContent);

// Live Classes
router.get('/live-classes', facultyController.getLiveClasses);
router.post('/live-classes', facultyController.scheduleLiveClass);
router.get('/batches', facultyController.getBatches);
router.put('/profile', facultyController.updateProfile);

// Students
router.get('/students', facultyController.getStudents);
router.get('/students/:id/metrics', facultyController.getStudentMetrics);
router.post('/profile/request-update', facultyController.createProfileRequest);

module.exports = router;
