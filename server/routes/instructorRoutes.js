const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const instructorController = require('../controllers/instructorController');
const contentController = require('../controllers/contentController');

// Apply middleware to all routes in this router
router.use(protect);
router.use(authorizeRoles('instructor', 'admin'));

// Dashboard
router.get('/dashboard', instructorController.getDashboardStats);

// Content Management (Subjects)
router.route('/subjects')
    .get(contentController.getSubjects)
    .post(contentController.createSubject);
router.route('/subjects/:id')
    .put(contentController.updateSubject)
    .delete(contentController.deleteSubject);
router.patch('/subjects/:id/assign', contentController.assignSubject);

// Content Management (Chapters)
router.get('/subjects/:subjectId/chapters', contentController.getChaptersBySubject);
router.post('/chapters', contentController.createChapter);
router.route('/chapters/:id')
    .put(contentController.updateChapter)
    .delete(contentController.deleteChapter);
router.patch('/chapters/:id/assign', contentController.assignChapter);

// Content Management (Recorded Classes & FAQ)
router.get('/chapters/:chapterId/videos', contentController.getVideosByChapter);
router.get('/videos/pending', instructorController.getPendingRecordedClasses);
router.post('/videos/upload', contentController.uploadVideo);
router.route('/videos/:id')
    .put(contentController.updateVideo)
    .delete(contentController.deleteVideo);
router.patch('/videos/:id/assign', instructorController.assignRecordedClass);
router.patch('/videos/:id/link', contentController.linkVideoToChapter);

// Content Management (Assessments: Tests & Assignments)
router.get('/assessments/pending', instructorController.getPendingAssessments);
router.patch('/assessments/:id/:type/approve', instructorController.approveAssessment);

// Faculty Management
router.get('/faculties', instructorController.getFaculties);

// Student Analysis & Management
router.get('/students', instructorController.getStudents);
router.route('/students/:id')
    .put(instructorController.updateStudent)
    .delete(instructorController.deleteStudent);
router.patch('/students/:id/status', instructorController.toggleStudentStatus);
router.get('/students/:id/analysis', instructorController.getStudentAnalysis);
router.post('/students/:id/notes', instructorController.addStudentNote);

// Class Management
router.route('/classes')
    .get(instructorController.getStudyClasses)
    .post(instructorController.createStudyClass);
router.route('/classes/:id')
    .put(instructorController.updateStudyClass)
    .delete(instructorController.deleteStudyClass);

// Batch Management
router.route('/batches')
    .get(instructorController.getBatches)
    .post(instructorController.createBatch);
router.route('/batches/:id')
    .put(instructorController.updateBatch)
    .delete(instructorController.deleteBatch);
router.patch('/batches/move-student', instructorController.moveStudentBatch);
router.patch('/batches/:id/students', instructorController.updateBatchStudents);

// Notifications
router.post('/notifications', instructorController.sendNotification);

// Assignments Distribution
router.get('/assignments', instructorController.getAssignments);
router.patch('/assignments/:id/distribute', instructorController.distributeAssignment);

module.exports = router;
