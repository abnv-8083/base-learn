const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const Subject = require('../models/Subject');
const Student = require('../models/Student');
const Chapter = require('../models/Chapter');
const Batch = require('../models/Batch');
const RecordedClass = require('../models/RecordedClass');
const LiveClass = require('../models/LiveClass');
const Assignment = require('../models/Assignment');
const Test = require('../models/Test');

// @desc    Get dashboard summary for student
// @route   GET /api/student/dashboard
// @access  Private (Student)
const getDashboard = asyncHandler(async (req, res) => {
    const studentId = req.user._id;

  const studentBatch = await Batch.findOne({ students: studentId }).populate('studyClass instructor').lean();
  let assignedSubjects = [];
  let recordedCount = 0;
  
  if (studentBatch) {
    assignedSubjects = await Subject.find({ assignedTo: studentBatch._id }).lean();
    recordedCount = await RecordedClass.countDocuments({ 
        status: 'published',
        assignedTo: { $in: [studentBatch._id] }
    });
  }

  const liveCount = await LiveClass.countDocuments({ 
      status: { $in: ['upcoming', 'ongoing'] },
      batch: studentBatch?._id 
  });
  
  const totalAssignments = await Assignment.countDocuments();
  const assignmentsData = await Assignment.find({ 'submissions.studentId': studentId });
  const completedAssignments = assignmentsData.length;
  const pendingAssignments = totalAssignments - completedAssignments;

  res.status(200).json({
    success: true,
    data: {
      recordedClassesAvailable: recordedCount,
      upcomingLiveClasses: liveCount,
      pendingAssignments: pendingAssignments >= 0 ? pendingAssignments : 0,
      completionRate: totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0,
      
      hasPaid: studentDetails?.hasPaid || false,
      batch: studentBatch ? {
        id: studentBatch._id,
        name: studentBatch.name,
        className: studentBatch.studyClass?.name
      } : null,
      faculty: studentBatch?.instructor ? {
        id: studentBatch.instructor._id,
        name: studentBatch.instructor.name,
        email: studentBatch.instructor.email
      } : null,
      subjects: assignedSubjects.map(s => ({
        id: s._id,
        name: s.name,
        progress: 0 // Default to zero if progress tracking not implemented
      }))
    }
  });
});

// @desc    Get all published recorded classes
// @route   GET /api/student/recorded-classes
// @access  Private (Student)
const getRecordedClasses = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const studentBatch = await Batch.findOne({ students: studentId });
  
  if (!studentBatch) {
    return res.status(200).json({ success: true, count: 0, data: [] });
  }

  const batchId = new mongoose.Types.ObjectId(studentBatch._id);
  const classId = studentBatch.studyClass ? new mongoose.Types.ObjectId(studentBatch.studyClass._id || studentBatch.studyClass) : null;

  // 1. Find all videos specifically assigned to this batch (videos are always batch-specific)
  const assignedVideos = await RecordedClass.find({
      status: 'published',
      assignedTo: { $in: [batchId] }
  }).populate('chapter subject').lean();

  const implicitSubjectIds = [...new Set(assignedVideos.map(v => v.subject?._id || v.subject))].filter(Boolean);
  const implicitChapterIds = [...new Set(assignedVideos.map(v => v.chapter?._id || v.chapter))].filter(Boolean);

  // 2. Find all subjects (explicitly assigned to Batch/Class OR containing assigned videos)
  const subjects = await Subject.find({ 
    $or: [
      { assignedTo: { $in: [batchId, classId] } }, // Check Batch or Parent Class
      { _id: { $in: implicitSubjectIds } }
    ]
  }).lean();
  const subjectIds = subjects.map(s => s._id);

  // 3. Find all chapters (explicitly assigned to Batch/Class OR containing assigned videos)
  const chapters = await Chapter.find({
      $or: [
          { assignedTo: { $in: [batchId, classId] } },
          { _id: { $in: implicitChapterIds } },
          { subject: { $in: subjectIds } }
      ]
  }).lean();
 
  // Combine into hierarchy matching MOCK_SUBJECTS format
  const colors = [
    { color: 'var(--color-primary)', bg: 'var(--color-primary-light)', icon: '📚' },
    { color: 'var(--color-success)', bg: 'var(--color-success-light)', icon: '🔬' },
    { color: 'var(--color-warning)', bg: 'var(--color-warning-light)', icon: '💻' },
    { color: 'var(--color-danger)', bg: 'var(--color-danger-light)', icon: '📐' }
  ];

  const hierarchy = subjects.map((sub, index) => {
    const cTheme = colors[index % colors.length];
    
    // Filter chapters belonging to this subject
    const subChapters = chapters.filter(c => c.subject?.toString() === sub._id.toString());
    
    const mappedChapters = subChapters.map(chap => {
       // Filter videos belonging to this chapter (from our pre-fetched assigned list)
       const chapVideos = assignedVideos.filter(v => {
          const videoChapterId = v.chapter?._id || v.chapter;
          return videoChapterId && videoChapterId.toString() === chap._id.toString();
       });
       
       // A chapter is visible if:
       // 1. It has assigned videos
       // 2. It is explicitly assigned to the batch or class
       const isExplicitlyAssigned = chap.assignedTo?.some(id => 
          id.toString() === batchId.toString() || (classId && id.toString() === classId.toString())
       );
       
       if (chapVideos.length === 0 && !isExplicitlyAssigned) {
         return null; // Skip empty chapters unless explicitly assigned
       }
       
       return {
         id: chap._id,
         title: chap.name,
         progress: 0, 
         videos: chapVideos.filter(v => (v.contentType || 'lecture') !== 'faq').map(v => ({
           id: v._id,
           title: v.title,
           duration: 'Varies',
           date: new Date(v.publishedAt || v.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
           videoUrl: v.videoUrl,
           assignmentUrl: v.assignmentUrl,
           description: v.description || 'No description available.',
           type: 'lecture'
         })),
         faqs: chapVideos.filter(v => v.contentType === 'faq').map(v => ({
           id: v._id,
           title: v.title,
           date: new Date(v.publishedAt || v.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
           videoUrl: v.videoUrl,
           assignmentUrl: v.assignmentUrl,
           description: v.description || 'FAQ recording.',
           type: 'faq'
         })),
         notes: chap.notes || [],
         liveNotes: chap.liveNotes || [],
         dpps: chap.dpps || [],
         pyqs: chap.pyqs || []
       };
    });

    return {
      id: sub._id,
      title: sub.name,
      description: sub.description,
      icon: '📚', // Default icon for all subjects
      color: '#10b981', // Brand green
      bg: '#ecfdf5',
      chapters: mappedChapters.filter(Boolean)
    };
  });

  const finalData = hierarchy.filter(s => {
    const subObj = subjects.find(sub => sub._id.toString() === s.id.toString());
    const isExplicitlyAssigned = subObj?.assignedTo?.some(id => 
       id.toString() === batchId.toString() || (classId && id.toString() === classId.toString())
    );
    return s.chapters.length > 0 || isExplicitlyAssigned;
  });
  res.status(200).json({ success: true, count: finalData.length, data: finalData });
});

// @desc    Get upcoming and past live classes
// @route   GET /api/student/live-classes
// @access  Private (Student)
const getLiveClasses = asyncHandler(async (req, res) => {
  const upcoming = await LiveClass.find({ status: 'upcoming' }).sort('scheduledAt');
  const past = await LiveClass.find({ status: { $in: ['completed', 'cancelled'] } }).sort('-scheduledAt');

  res.status(200).json({
    success: true,
    data: { upcoming, past }
  });
});

// @desc    Get student assignments
const getAssignments = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const studentBatch = await Batch.findOne({ students: studentId });
  if (!studentBatch) return res.status(200).json({ success: true, count: 0, data: [] });

  // Strictly filter by published items assigned to this batch
  const allAssignments = await Assignment.find({ 
    status: 'published',
    assignedBatches: studentBatch._id 
  }).sort('deadline');

  const data = allAssignments.map(a => {
    const doc = a.toObject();
    const submission = doc.submissions.find(s => s.studentId === studentId.toString());
    delete doc.submissions; 
    if (submission) {
      doc.studentStatus = (submission.marks != null) ? 'Graded' : 'Submitted';
      doc.mySubmission = submission;
    } else {
      doc.studentStatus = new Date(doc.deadline) < new Date() ? 'Overdue' : 'Pending';
    }
    return doc;
  });

  res.status(200).json({ success: true, count: data.length, data });
});

// @desc    Get student tests
const getTests = asyncHandler(async (req, res) => {
    const studentId = req.user._id;
    const studentBatch = await Batch.findOne({ students: studentId });
    if (!studentBatch) return res.status(200).json({ success: true, count: 0, data: [] });

    const tests = await Test.find({ 
        status: 'published',
        assignedTo: studentBatch._id 
    }).sort('deadline');

    res.status(200).json({ success: true, count: tests.length, data: tests });
});

// @desc    Get Main (Root) Assessments
const getMainAssessments = asyncHandler(async (req, res) => {
    const studentId = req.user._id;
    const studentBatch = await Batch.findOne({ students: studentId });
    if (!studentBatch) return res.status(200).json({ success: true, data: { tests: [], assignments: [] } });

    const tests = await Test.find({ 
        status: 'published', 
        isMain: true,
        assignedTo: studentBatch._id 
    }).lean();

    const assignments = await Assignment.find({ 
        status: 'published', 
        isMain: true,
        assignedBatches: studentBatch._id 
    }).lean();

    res.status(200).json({ success: true, data: { tests, assignments } });
});

const updateProfile = async (req, res) => {
    try {
        const user = await Student.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.phone = req.body.phone || user.phone;
            user.school = req.body.school || user.school;
            user.studentClass = req.body.studentClass || user.studentClass;
            user.parentName = req.body.parentName || user.parentName;
            user.parentPhone = req.body.parentPhone || user.parentPhone;

            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                phone: updatedUser.phone,
                school: updatedUser.school,
                studentClass: updatedUser.studentClass,
                parentName: updatedUser.parentName,
                parentPhone: updatedUser.parentPhone,
                profilePhoto: updatedUser.profilePhoto, 
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get live FAQ sessions (Upcoming, Ongoing, Past)
const getLiveFaqSessions = asyncHandler(async (req, res) => {
    const studentId = req.user._id;
    const studentBatch = await Batch.findOne({ students: studentId });
    
    if (!studentBatch) {
        return res.status(200).json({ success: true, data: [] });
    }

    const sessions = await LiveClass.find({
        batch: studentBatch._id,
        type: 'faq'
    })
    .populate('faculty', 'name')
    .sort({ scheduledAt: -1 });

    res.status(200).json({ success: true, data: sessions });
});

const mockPayment = asyncHandler(async (req, res) => {
  const user = await Student.findById(req.user._id);
  if (user) {
    user.hasPaid = true;
    await user.save();
    res.status(200).json({ success: true, message: 'Payment successful! Dashboard unlocked.' });
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }
});

module.exports = {
  getDashboard,
  getRecordedClasses,
  getLiveClasses,
  getAssignments,
  getTests,
  getMainAssessments,
  getLiveFaqSessions,
  updateProfile,
  mockPayment
};
