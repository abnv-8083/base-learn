const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { upload, cloudinaryVideoUpload, cloudinaryMixedUpload, localAssignmentUpload, localMixedUpload } = require('../middleware/uploadMiddleware');
const contentController = require('../controllers/contentController');
const facultyController = require('../controllers/facultyController');

router.use(protect);
router.use(authorizeRoles('faculty', 'admin'));

// Dashboard
router.get('/dashboard', facultyController.getDashboardStats);

// Subjects & Chapters (read-only for faculty, scoped to their assignments)
router.get('/subjects', facultyController.getAssignedSubjects);
router.get('/subjects/:subjectId/chapters', contentController.getChaptersBySubject);
router.post('/chapters', contentController.createChapter);

// Content Upload — using Cloudinary Storage for videos and resources
router.get('/content', facultyController.getAllContent);
router.post('/content/upload', cloudinaryMixedUpload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'assignment', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
]), facultyController.uploadContent);

// Live Classes
router.get('/live-classes', facultyController.getLiveClasses);
router.post('/live-classes', facultyController.scheduleLiveClass);
router.get('/live-classes/:id/start', facultyController.startLiveClass);
router.post('/live-classes/:id/end', facultyController.endLiveClass);
router.delete('/live-classes/:id', facultyController.deleteLiveClass);
router.get('/batches', facultyController.getBatches);
router.put('/profile', facultyController.updateProfile);

// Students
router.get('/students', facultyController.getStudents);
router.get('/students/:id/metrics', facultyController.getStudentMetrics);
router.post('/students/:id/notes', facultyController.addStudentNote);
router.post('/profile/request-update', facultyController.createProfileRequest);

// Content Management (CRUD for each type)
router.get('/content/analysis/:id', facultyController.getContentAnalysis);
router.get('/content/manage/:type', facultyController.getUploadedContent);
router.put('/content/manage/:type/:id', cloudinaryMixedUpload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'assignment', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
]), facultyController.updateUploadedContent);
router.delete('/content/manage/:type/:id', facultyController.deleteUploadedContent);

// Assessments & Grading
router.get('/assessments/forwarded', facultyController.getForwardedSubmissions);
router.post('/assessments/:id/grade/:studentId', facultyController.gradeSubmission);

// Faculty badge counts
router.get('/badge-counts', async (req, res) => {
    try {
        const Assignment = require('../models/Assignment');
        const LiveClass  = require('../models/LiveClass');
        const Notification = require('../models/Notification');
        const facultyId  = req.user.userId;

        const [pendingGrading, ongoingSession, rejectedContent, unreadNotifs] = await Promise.all([
            Assignment.countDocuments({ faculty: facultyId, 'submissions.0': { $exists: true } }),
            LiveClass.countDocuments({ faculty: facultyId, status: 'ongoing' }),
            require('../models/RecordedClass').countDocuments({ faculty: facultyId, status: 'rejected' }),
            Notification.countDocuments({ recipient: facultyId, read: false })
        ]);
        res.json({ success: true, data: { pendingGrading, ongoingSession: ongoingSession > 0, rejectedContent, unreadNotifs } });
    } catch {
        res.json({ success: true, data: { pendingGrading: 0, ongoingSession: false, rejectedContent: 0, unreadNotifs: 0 } });
    }
});

module.exports = router;
