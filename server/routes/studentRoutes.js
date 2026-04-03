const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const {
  getDashboard,
  getRecordedClasses,
  getLiveClasses,
  getAssignments,
  getTests,
  getMainAssessments,
  getAllAssessments,
  submitAssessment,
  getLiveFaqSessions,
  getCalendar,
  updateProfile,
  mockPayment,
  trackRecordedClassAction,
  sendEnquiry,
  getProgression,
  joinLiveClass
} = require('../controllers/studentController');

// All routes require authentication
router.use(protect);

// Optionally enforce 'student' role via authorizeRoles('student') 
// but for scaffolding we'll just let any authenticated user hit them for easy testing
// router.use(authorizeRoles('student'));

router.get('/dashboard', getDashboard);
router.get('/progression', getProgression);
router.get('/recorded-classes', getRecordedClasses);
router.get('/live-classes', getLiveClasses);
router.get('/live-classes/:id/join', joinLiveClass);
router.get('/assignments', getAssignments);
router.get('/tests', getTests);
router.get('/assessments', getAllAssessments);
router.post('/assessments/:id/submit', upload.single('file'), submitAssessment);
router.get('/main-assessments', getMainAssessments);
router.get('/faq/live-sessions', getLiveFaqSessions);
router.get('/calendar', getCalendar);
router.put('/profile', updateProfile);
router.post('/pay', mockPayment);
router.patch('/recorded-classes/:id/track', trackRecordedClassAction);
router.post('/enquiry', sendEnquiry);

module.exports = router;
