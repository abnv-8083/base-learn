const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { cloudinaryMixedUpload } = require('../middleware/uploadMiddleware');
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
  joinLiveClass,
  leaveLiveClass,
  trackDeviceEvent
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
router.post('/live-classes/:id/leave', leaveLiveClass);
router.post('/live-classes/:id/device-event', trackDeviceEvent);
router.get('/assignments', getAssignments);
router.get('/tests', getTests);
router.get('/assessments', getAllAssessments);
router.post('/assessments/:id/submit', cloudinaryMixedUpload.single('file'), submitAssessment);
router.get('/main-assessments', getMainAssessments);
router.get('/faq/live-sessions', getLiveFaqSessions);
router.get('/calendar', getCalendar);
router.put('/profile', updateProfile);
router.post('/pay', mockPayment);
router.patch('/recorded-classes/:id/track', trackRecordedClassAction);
router.post('/enquiry', sendEnquiry);

router.get('/badge-counts', async (req, res) => {
  try {
    const Assignment = require('../models/Assignment');
    const Test       = require('../models/Test');
    const LiveClass  = require('../models/LiveClass');
    const Batch      = require('../models/Batch');
    const studentId  = req.user.userId || req.user._id;

    // Find the student's batch to scope live class count
    const studentBatch = await Batch.findOne({ students: studentId }).lean();
    const batchFilter = studentBatch ? { batches: studentBatch._id } : {};

    const [pendingAssignments, pendingTests, upcomingLive] = await Promise.all([
      Assignment.countDocuments({ status: 'published', 'submissions.studentId': { $ne: studentId } }),
      Test.countDocuments({ status: 'published', 'submissions.studentId': { $ne: studentId } }),
      LiveClass.countDocuments({ status: { $in: ['upcoming', 'ongoing'] }, ...batchFilter })
    ]);
    res.json({ success: true, data: { pendingAssignments, pendingTests, upcomingLive } });
  } catch {
    res.json({ success: true, data: { pendingAssignments: 0, pendingTests: 0, upcomingLive: 0 } });
  }
});

module.exports = router;
