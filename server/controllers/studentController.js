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
const SystemSettings = require('../models/SystemSettings');
const Faculty = require('../models/Faculty');
const Instructor = require('../models/Instructor');
const StudyClass = require('../models/StudyClass');
const { sendWhatsAppMessage } = require('../utils/whatsappService');
const sendEmail = require('../utils/sendEmail');
const bbb = require('../utils/bbb');
const { uploadToS3, deleteFromS3 } = require('../utils/s3');

// Helper to normalize S3 URLs to Path-Style for E2E EOS compatibility
const normalizeS3Url = (url) => {
    if (!url || typeof url !== 'string' || !url.includes('e2enetworks.net')) return url;
    
    // If it's already Path-Style (https://endpoint/bucket/key), leave it
    // If it's Virtual-Hosted (https://bucket.endpoint/key), convert it
    try {
        const urlObj = new URL(url);
        const hostParts = urlObj.hostname.split('.');
        
        // Check if the first part is the bucket name (baselearnmedia2026)
        if (hostParts[0] === process.env.R2_BUCKET_NAME) {
            const newHostname = hostParts.slice(1).join('.');
            return `https://${newHostname}/${process.env.R2_BUCKET_NAME}${urlObj.pathname}`;
        }
    } catch (e) {
        return url;
    }
    return url;
};

// @desc    Get dashboard summary for student
// @route   GET /api/student/dashboard
// @access  Private (Student)
const getDashboard = asyncHandler(async (req, res) => {
    const studentId = req.user._id;
    const studentBatch = await Batch.findOne({ students: studentId }).populate('studyClass instructor').lean();
    
    if (!studentBatch) {
        return res.status(200).json({ success: true, data: { recordedClassesAvailable: 0, liveClassesCount: 0, pendingAssignments: 0, completionRate: 0, upcomingLiveClasses: [], latestAssessments: { assignments: [], tests: [] }, recentVideos: [] } });
    }

    const studentBatchId = studentBatch._id;
    const studentClassId = studentBatch.studyClass?._id;

    const assignedSubjects = await Subject.find({ 
        $or: [
            { assignedTo: studentBatchId },
            ...(studentClassId ? [{ assignedTo: studentClassId }] : [])
        ]
    }).lean();

    const subjectIds = assignedSubjects.map(s => s._id);

    // 1. Stats
    const recordedCount = await RecordedClass.countDocuments({ 
        status: 'published',
        $or: [{ assignedTo: studentBatchId }, { subject: { $in: subjectIds } }]
    });

    const liveCount = await LiveClass.countDocuments({ 
        status: { $in: ['upcoming', 'ongoing'] },
        batches: studentBatchId 
    });

    const totalAssignments = await Assignment.countDocuments({
        status: 'published',
        $or: [{ subject: { $in: subjectIds } }, { assignedBatches: studentBatchId }, { assignedClasses: studentClassId }]
    });

    const completedAssignments = await Assignment.countDocuments({
        status: 'published',
        $or: [{ subject: { $in: subjectIds } }, { assignedBatches: studentBatchId }, { assignedClasses: studentClassId }],
        'submissions.studentId': studentId
    });

    const pendingAssignments = totalAssignments - completedAssignments;
    const completionRate = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

    // 2. Data Lists
    const upcomingLiveClasses = await LiveClass.find({
        status: { $in: ['upcoming', 'ongoing'] },
        batches: studentBatchId
    }).populate('faculty', 'name').sort({ startTime: 1 }).limit(3).lean();

    const [latestAssignments, latestTests] = await Promise.all([
        Assignment.find({
            status: 'published',
            $or: [{ subject: { $in: subjectIds } }, { assignedBatches: studentBatchId }, { assignedClasses: studentClassId }]
        }).populate('facultyId', 'name').populate('subject', 'name').sort({ createdAt: -1 }).limit(3).lean(),
        Test.find({
            status: 'published',
            $or: [{ subject: { $in: subjectIds } }, { assignedTo: studentBatchId }, { assignedClasses: studentClassId }]
        }).populate('faculty', 'name').populate('subject', 'name').sort({ createdAt: -1 }).limit(3).lean()
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const recentVideos = await RecordedClass.find({
        status: 'published',
        $or: [{ subject: { $in: subjectIds } }, { assignedTo: studentBatchId }],
        createdAt: { $gte: today }
    }).populate('faculty', 'name').populate('subject', 'name').sort({ createdAt: -1 }).limit(5).lean();

    res.status(200).json({
        success: true,
        data: {
          recordedClassesAvailable: recordedCount,
          liveClassesCount: liveCount,
          pendingAssignments,
          completionRate,
          upcomingLiveClasses,
          latestAssessments: {
              assignments: latestAssignments.map(a => ({ ...a, fileUrl: normalizeS3Url(a.fileUrl) })),
              tests: latestTests.map(t => ({ ...t, fileUrl: normalizeS3Url(t.fileUrl) }))
          },
          recentVideos: recentVideos.map(v => ({ ...v, videoUrl: normalizeS3Url(v.videoUrl), thumbnail: normalizeS3Url(v.thumbnail) })),
          batch: {
            id: studentBatchId,
            name: studentBatch.name,
            className: studentBatch.studyClass?.name
          },
          faculty: studentBatch.instructor ? {
            id: studentBatch.instructor._id,
            name: studentBatch.instructor.name,
            email: studentBatch.instructor.email
          } : null,
          subjects: assignedSubjects.map(s => ({
            id: s._id,
            name: s.name,
            progress: 0 
          }))
        }
    });
});

// @desc    Get all published recorded classes
// @route   GET /api/student/recorded-classes
// @access  Private (Student)
const getRecordedClasses = asyncHandler(async (req, res) => {
  try {
    const studentId = req.user?._id;
    if (!studentId) return res.status(200).json({ success: false, message: "User session missing" });

    const studentBatch = await Batch.findOne({ students: studentId });
    if (!studentBatch) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const studentBatchId = studentBatch._id;
    const studentClassId = studentBatch.studyClass?.toString() || null;

    const subjects = await Subject.find({ 
      $or: [
          { assignedTo: studentBatchId },
          ...(studentClassId ? [{ assignedTo: studentClassId }] : [])
      ]
    }).lean().catch(() => []);
    
    const subjectIds = (subjects || []).map(s => s._id);

    const allChapters = await Chapter.find({ subject: { $in: subjectIds } }).lean().catch(() => []);

    const hierarchy = await Promise.all((subjects || []).map(async (sub) => {
      try {
        const subjectChapters = (allChapters || []).filter(c => c.subject?.toString() === sub._id.toString());
        
        const mappedChapters = await Promise.all(subjectChapters.map(async (chap) => {
           try {
             // Find published videos for this chapter
             const contentFilter = {
                chapter: chap._id,
                status: 'published',
                assignedTo: studentBatchId 
             };

             const chapVideos = await RecordedClass.find(contentFilter).populate('faculty', 'name').lean().catch(() => []);

              const chapAssignments = await Assignment.find({
                 chapter: chap._id,
                 status: 'published',
                 assignedBatches: studentBatchId
              }).populate('facultyId', 'name').lean().catch(() => []);

              const chapTests = await Test.find({
                 chapter: chap._id,
                 status: 'published',
                 assignedTo: studentBatchId
              }).populate('faculty', 'name').lean().catch(() => []);

             const resources = [];
             ['notes', 'liveNotes', 'dpps', 'pyqs'].forEach(field => {
                const items = (chap[field] || []).filter(r => r && r.status === 'published');
                items.forEach(item => {
                  if (item && item.url) {
                    resources.push({
                       _id: item._id,
                       title: item.title || "Document",
                       description: item.description || "",
                       fileUrl: normalizeS3Url(item.url),
                       createdAt: item.publishedAt || item.uploadedAt,
                       type: field.replace('s', ''),
                       isResource: true
                    });
                  }
                });
             });

             const allContent = [
                ...(chapVideos || []).map(v => ({
                  _id: v._id,
                  title: v.title || "Untitled Video",
                  thumbnail: normalizeS3Url(v.thumbnail) || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop',
                  description: v.description || "",
                  fileUrl: normalizeS3Url(v.videoUrl),
                  assignmentUrl: normalizeS3Url(v.assignmentUrl),
                  faculty: v.faculty,
                  createdAt: v.createdAt,
                  type: v.contentType || 'lecture',
                  isResource: false
                })),
                 ...(chapAssignments || []).map(a => ({
                   _id: a._id,
                   title: a.title || "Assignment",
                   description: a.description || "",
                   fileUrl: normalizeS3Url(a.fileUrl),
                   faculty: a.facultyId,
                   createdAt: a.createdAt,
                   deadline: a.deadline,
                   type: 'assignment',
                   isResource: true,
                   isAssessment: true
                 })),
                 ...(chapTests || []).map(t => ({
                   _id: t._id,
                   title: t.title || "Mock Test",
                   description: t.description || "",
                   fileUrl: normalizeS3Url(t.fileUrl),
                   faculty: t.faculty,
                   createdAt: t.createdAt,
                   deadline: t.deadline,
                   type: 'test',
                   isResource: true,
                   isAssessment: true
                 })),
                ...resources
             ];

             return {
               id: chap._id,
               title: chap.name || "Untitled Chapter",
               description: chap.description || "",
               videos: allContent
             };
           } catch (chapErr) {
             console.error("Chapter Error:", chapErr);
             return null;
           }
        }));

        const chapters = (mappedChapters || []).filter(Boolean);
        if (chapters.length === 0) return null;

        return {
          id: sub._id,
          title: sub.name || "Unnamed Subject",
          description: sub.description || "",
          icon: '📚',
          chapters
        };
      } catch (subErr) {
        console.error("Subject Error:", subErr);
        return null;
      }
    }));

    const finalData = (hierarchy || []).filter(Boolean);
    res.status(200).json({ success: true, count: finalData.length, data: finalData });
  } catch (error) {
    console.error('RECORDED CLASSES ERROR:', error);
    res.status(200).json({ success: false, crash_message: error.message, stack: error.stack });
  }
});

// @desc    Get upcoming and past live classes for the student's batch
// @route   GET /api/student/live-classes
// @access  Private (Student)
const getLiveClasses = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  // Find which batch this student belongs to
  const studentBatch = await Batch.findOne({ students: studentId }).lean();

  if (!studentBatch) {
    return res.status(200).json({ success: true, data: { upcoming: [], past: [] } });
  }

  const batchId = studentBatch._id;

  // Filter live classes where this batch is in the 'batches' array
  const selectFields = 'title subject faculty scheduledAt duration status type meetingLink recordingUrl presentationUrl';

  const upcoming = await LiveClass.find({ 
    status: { $in: ['upcoming', 'ongoing'] }, 
    batches: batchId 
  })
    .select(selectFields)
    .populate('faculty', 'name')
    .sort('scheduledAt')
    .lean();

  const past = await LiveClass.find({ 
    status: { $in: ['completed', 'cancelled'] }, 
    batches: batchId 
  })
    .select(selectFields)
    .populate('faculty', 'name')
    .sort('-scheduledAt')
    .lean();

  res.status(200).json({
    success: true,
    data: { upcoming, past }
  });
});

// @desc    Join a live BigBlueButton class (Get Viewer URL)
// @route   GET /api/student/live-classes/:id/join
const joinLiveClass = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const studentId = req.user._id;

    const liveClass = await LiveClass.findById(id).lean();
    if (!liveClass) return res.status(404).json({ message: 'Live class not found' });
    
    if (liveClass.status !== 'ongoing') {
        const errorMsg = liveClass.status === 'upcoming' 
            ? 'The instructor has not started the class yet. Please wait.' 
            : 'This meeting has already ended.';
        return res.status(400).json({ message: errorMsg });
    }

    // Verify the student is in one of the batches assigned to this live class
    const assignedBatchIds = liveClass.batches || [];
    const studentBatch = assignedBatchIds.length > 0
        ? await Batch.findOne({ _id: { $in: assignedBatchIds }, students: studentId })
        : null;
    if (!studentBatch && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized. You are not enrolled in the batch for this live class.' });
    }

    const meetingId = liveClass._id.toString();
    const attendeePW = 'viewer123';
    
    const joinUrl = bbb.getJoinUrl(meetingId, req.user.name, attendeePW, req.user._id);
    
    // Non-blocking Attendance Tracking
    const existingAttendance = await LiveClass.findOne({ _id: id, 'attendance.studentId': studentId });
    if (!existingAttendance) {
        await LiveClass.findByIdAndUpdate(id, {
            $push: { attendance: { studentId, attended: true, joinTime: new Date(), deviceEvents: [] } }
        });
    } else {
        // Re-join: update joinTime (latest join wins)
        await LiveClass.updateOne(
            { _id: id, 'attendance.studentId': studentId },
            { $set: { 'attendance.$.joinTime': new Date(), 'attendance.$.attended': true } }
        );
    }

    res.status(200).json({ success: true, data: { joinUrl } });
});

// @desc    Get student assignments
const getAssignments = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const studentBatch = await Batch.findOne({ students: studentId });
  if (!studentBatch) return res.status(200).json({ success: true, count: 0, data: [] });

  // Find subjects assigned to either this student's Batch OR their Class
  const subjects = await Subject.find({ 
    $or: [
      { assignedTo: studentBatch._id },
      { assignedTo: studentBatch.studyClass }
    ]
  }).distinct('_id');

  // Then, find all published assignments for those subjects
  const allAssignments = await Assignment.find({ 
    status: 'published',
    subject: { $in: subjects }
  }).sort('deadline');

  const data = allAssignments.map(a => {
    const doc = a.toObject();
    const submission = doc.submissions?.find(s => s.studentId?.toString() === studentId.toString());
    delete doc.submissions; 
    
    if (submission) {
      doc.studentStatus = (submission.status === 'graded' || submission.marks != null) ? 'Graded' : 'Submitted';
      doc.mySubmission = submission;
    } else {
      doc.studentStatus = (doc.deadline && new Date(doc.deadline) < new Date()) ? 'Overdue' : 'Pending';
    }
    if (doc.fileUrl) doc.fileUrl = normalizeS3Url(doc.fileUrl);
    return doc;
  });

  res.status(200).json({ success: true, count: data.length, data });
});

// @desc    Get student tests
const getTests = asyncHandler(async (req, res) => {
    const studentId = req.user._id;
    const studentBatch = await Batch.findOne({ students: studentId });
    if (!studentBatch) return res.status(200).json({ success: true, count: 0, data: [] });

    const subjects = await Subject.find({ 
        $or: [
          { assignedTo: studentBatch._id },
          { assignedTo: studentBatch.studyClass }
        ]
    }).distinct('_id');

    const allTests = await Test.find({ 
        status: 'published',
        subject: { $in: subjects }
    }).sort('deadline');
    
    const data = allTests.map(t => {
        const doc = t.toObject();
        const submission = doc.submissions?.find(s => s.studentId?.toString() === studentId.toString());
        delete doc.submissions;
        
        if (submission) {
            doc.studentStatus = (submission.status === 'graded' || submission.marks != null) ? 'Graded' : 'Submitted';
            doc.mySubmission = submission;
        } else {
            doc.studentStatus = (doc.deadline && new Date(doc.deadline) < new Date()) ? 'Overdue' : 'Pending';
        }
        if (doc.fileUrl) doc.fileUrl = normalizeS3Url(doc.fileUrl);
        return doc;
    });

    res.status(200).json({ success: true, count: data.length, data });
});

// @desc    Get Main (Root) Assessments
const getMainAssessments = asyncHandler(async (req, res) => {
    const studentId = req.user._id;
    const studentBatch = await Batch.findOne({ students: studentId });
    if (!studentBatch) return res.status(200).json({ success: true, data: { tests: [], assignments: [] } });

    const subjects = await Subject.find({ 
        $or: [
          { assignedTo: studentBatch._id },
          { assignedTo: studentBatch.studyClass }
        ]
    }).distinct('_id');

    const tests = await Test.find({ 
        status: 'published', 
        isMain: true,
        subject: { $in: subjects }
    }).lean();

    const assignments = await Assignment.find({ 
        status: 'published', 
        isMain: true,
        subject: { $in: subjects }
    }).lean();

    // Normalize URLs
    const normalizedTests = tests.map(t => ({ ...t, fileUrl: normalizeS3Url(t.fileUrl) }));
    const normalizedAssignments = assignments.map(a => ({ ...a, fileUrl: normalizeS3Url(a.fileUrl) }));

    res.status(200).json({ success: true, data: { tests: normalizedTests, assignments: normalizedAssignments } });
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
            res.status(200).json({
                success: true,
                data: {
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
                }
            });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
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
        batches: studentBatch._id,
        type: 'faq'
    })
    .select('title subject faculty scheduledAt duration status type meetingLink recordingUrl')
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

// @desc    Calendar events: live classes, assignment & test deadlines for student's batch
// @route   GET /api/student/calendar
const getCalendar = asyncHandler(async (req, res) => {
    const studentId = req.user._id;
    const studentBatch = await Batch.findOne({ students: studentId });
    if (!studentBatch) {
        return res.status(200).json({ success: true, data: { events: [] } });
    }
    const batchId = studentBatch._id;
    const events = [];

    const liveSessions = await LiveClass.find({ batches: batchId })
        .select('title subject scheduledAt duration status type')
        .lean();
    for (const s of liveSessions) {
        if (!s.scheduledAt) continue;
        const start = new Date(s.scheduledAt);
        const mins = s.duration || 60;
        const end = new Date(start.getTime() + mins * 60 * 1000);
        events.push({
            id: `live-${s._id}`,
            type: 'live',
            title: s.title || 'Live class',
            subject: s.subject,
            start: start.toISOString(),
            end: end.toISOString(),
            status: s.status,
            sessionType: s.type || 'lecture',
        });
    }

    const assignments = await Assignment.find({
        status: 'published',
        assignedBatches: batchId,
    })
        .select('title deadline')
        .lean();
    for (const a of assignments) {
        if (!a.deadline) continue;
        const d = new Date(a.deadline);
        events.push({
            id: `asg-${a._id}`,
            type: 'assignment',
            title: a.title || 'Assignment',
            start: d.toISOString(),
            end: d.toISOString(),
            allDay: true,
        });
    }

    const tests = await Test.find({
        status: 'published',
        assignedTo: batchId,
    })
        .select('title deadline')
        .lean();
    for (const t of tests) {
        if (!t.deadline) continue;
        const d = new Date(t.deadline);
        events.push({
            id: `test-${t._id}`,
            type: 'test',
            title: t.title || 'Test',
            start: d.toISOString(),
            end: d.toISOString(),
            allDay: true,
        });
    }

    events.sort((a, b) => new Date(a.start) - new Date(b.start));
    res.status(200).json({ success: true, data: { events } });
});

const trackRecordedClassAction = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { action } = req.body; // 'click' or 'view'

    if (!['click', 'view'].includes(action)) {
        return res.status(400).json({ success: false, message: 'Invalid tracking action' });
    }

    const field = action === 'click' ? 'totalClicks' : 'totalViews';
    
    const updated = await RecordedClass.findByIdAndUpdate(
        id,
        { $inc: { [field]: 1 } },
        { new: true }
    );

    if (!updated) {
        return res.status(404).json({ success: false, message: 'Recorded class not found' });
    }

    res.status(200).json({ success: true, [field]: updated[field] });
});

// @desc    Get all unified assessments (Tests and Assignments)
const getAllAssessments = asyncHandler(async (req, res) => {
    const studentId = req.user._id;
    const studentBatch = await Batch.findOne({ students: studentId });
    if (!studentBatch) return res.status(200).json({ success: true, count: 0, data: [] });

    const batchId = studentBatch._id;
    const classId = studentBatch.studyClass;

    const subjects = await Subject.find({ 
        $or: [
          { assignedTo: batchId },
          { assignedTo: classId }
        ]
    }).distinct('_id');

    // Fetch both published Assignments and Tests for this batch or subject
    const assignments = await Assignment.find({ 
        status: 'published',
        $or: [
            { subject: { $in: subjects } },
            { assignedBatches: batchId },
            { assignedClasses: classId },
            { assignedStudents: studentId }
        ]
    }).populate('facultyId', 'name').populate('subject', 'name').lean();

    const tests = await Test.find({ 
        status: 'published',
        $or: [
            { subject: { $in: subjects } },
            { assignedTo: batchId },
            { assignedClasses: classId },
            { assignedStudents: studentId }
        ]
    }).populate('faculty', 'name').populate('subject', 'name').lean();

    // Map and combine
    const mappedAssignments = assignments.map(a => {
        const submission = a.submissions?.find(s => s.studentId?.toString() === studentId.toString());
        return {
            ...a,
            fileUrl: normalizeS3Url(a.fileUrl),
            assessmentType: 'assignment',
            assignedByFaculty: a.facultyId,
            studentStatus: submission ? ((submission.status === 'graded' || submission.marks != null) ? 'Graded' : 'Submitted') : ((a.deadline && new Date(a.deadline) < new Date()) ? 'Overdue' : 'Pending'),
            mySubmission: submission
        };
    });

    const mappedTests = tests.map(t => {
        const submission = t.submissions?.find(s => s.studentId?.toString() === studentId.toString());
        return {
            ...t,
            fileUrl: normalizeS3Url(t.fileUrl),
            assessmentType: 'test',
            assignedByFaculty: t.faculty,
            studentStatus: submission ? ((submission.status === 'graded' || submission.marks != null) ? 'Graded' : 'Submitted') : ((t.deadline && new Date(t.deadline) < new Date()) ? 'Overdue' : 'Pending'),
            mySubmission: submission
        };
    });

    const combined = [...mappedAssignments, ...mappedTests].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    res.status(200).json({ success: true, count: combined.length, data: combined });
});

// @desc    Submit student work for an assessment
const submitAssessment = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.body; // 'assignment' or 'test'
        const studentId = req.user._id;

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a PDF file.' });
        }

        const Model = type === 'test' ? Test : Assignment;
        const assessment = await Model.findById(id);
        if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found' });

        // Check if already submitted
        const existingSubmission = assessment.submissions.find(s => s.studentId.toString() === studentId.toString());
        if (existingSubmission) {
            return res.status(400).json({ success: false, message: 'You have already submitted this assessment.' });
        }

        const fileUrl = await uploadToS3(req.file, type === 'test' ? 'student-tests' : 'student-assignments');
        const isLate = assessment.deadline ? (new Date() > new Date(assessment.deadline)) : false;

        assessment.submissions.push({
            studentId,
            fileUrl,
            submittedAt: new Date(),
            status: 'submitted',
            isLate
        });

        await assessment.save();
        res.status(200).json({ success: true, message: 'Assessment submitted successfully.' });
    } catch (error) {
        console.error('[SUBMIT_ERROR]', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Submission failed. Internal Server Error.',
            details: error.name === 'ValidationError' ? error.errors : null
        });
    }
});

// @desc    Send student enquiry to admin
// @route   POST /api/student/enquiry
// @access  Private (Student)
const sendEnquiry = asyncHandler(async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message cannot be empty' });

    const student = await Student.findById(req.user._id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const settings = await SystemSettings.getSettings();

    const formattedMessage = `*New Student Enquiry*\n\n*Name:* ${student.name}\n*Email:* ${student.email}\n*Phone:* ${student.phone || 'N/A'}\n\n*Message:*\n${message}`;

    const { notificationPreference, admissionContactEmail, admissionContactWhatsApp } = settings;

    let emailSent = false;
    let waSent = false;

    if (['email', 'both'].includes(notificationPreference) && admissionContactEmail) {
        try {
            await sendEmail({
                email: admissionContactEmail,
                subject: `New Enquiry from ${student.name}`,
                html: `<p><strong>Name:</strong> ${student.name}</p><p><strong>Email:</strong> ${student.email}</p><p><strong>Phone:</strong> ${student.phone || 'N/A'}</p><hr/><p><strong>Message:</strong></p><p>${message.replace(/\n/g, '<br/>')}</p>`
            });
            emailSent = true;
        } catch (err) {
            console.error('Failed to send enquiry email:', err);
        }
    }

    if (['whatsapp', 'both'].includes(notificationPreference) && admissionContactWhatsApp) {
        try {
            await sendWhatsAppMessage(admissionContactWhatsApp, formattedMessage);
            waSent = true;
        } catch (err) {
            console.error('Failed to send enquiry whatsapp:', err);
        }
    }

    // Always create a database record so it shows up in Admin > Enquiries
    try {
        const AdmissionEnquiry = require('../models/AdmissionEnquiry');
        await AdmissionEnquiry.create({
            name: student.name,
            email: student.email,
            phone: student.phone || 'N/A',
            studentClass: student.studentClass || 'Current Student',
            message: message,
            status: 'new'
        });
    } catch (dbErr) {
        console.error('Failed to save enquiry to database:', dbErr.message);
    }

    if (!emailSent && !waSent && notificationPreference !== 'none') {
        console.warn('Enquiry logged but notifications failed to deliver to admin.');
        // We still return success to the student as their part is done.
    }

    res.status(200).json({ success: true, message: 'Enquiry sent successfully! Our team will get back to you.' });
});

// @desc    Get curriculum progression for student
// @route   GET /api/student/progression
// @access  Private (Student)
const getProgression = asyncHandler(async (req, res) => {
    try {
        const studentId = req.user?._id;
        if (!studentId) return res.status(200).json({ success: false, message: "User session missing" });

        const studentBatch = await Batch.findOne({ students: studentId }).lean();
        if (!studentBatch) {
            return res.status(200).json({ success: true, data: [] });
        }

        const studentBatchId = studentBatch._id;
        const studentClassId = studentBatch.studyClass?._id || studentBatch.studyClass || null;

        // Find all subjects assigned to this student (via Batch or Class)
        const subjects = await Subject.find({ 
            $or: [
                { assignedTo: studentBatchId },
                ...(studentClassId ? [{ assignedTo: studentClassId }] : [])
            ]
        }).populate('faculty', 'name').lean();

        if (!subjects || subjects.length === 0) {
            return res.status(200).json({ success: true, data: [] });
        }

        const progressionData = await Promise.all(subjects.map(async (subject) => {
            try {
                const subId = subject._id;

                const [videosCount, assignmentsCount, testsCount] = await Promise.all([
                    RecordedClass.countDocuments({ subject: subId, status: 'published', $or: [{ assignedTo: studentBatchId }, ...(studentClassId ? [{ assignedTo: studentClassId }] : [])] }).catch(() => 0),
                    Assignment.countDocuments({ subject: subId, status: 'published', $or: [{ assignedBatches: studentBatchId }, ...(studentClassId ? [{ assignedClasses: studentClassId }] : [])] }).catch(() => 0),
                    Test.countDocuments({ subject: subId, status: 'published', $or: [{ assignedTo: studentBatchId }, ...(studentClassId ? [{ assignedClasses: studentClassId }] : [])] }).catch(() => 0)
                ]);

                const watchProgressRaw = await RecordedClass.find({ 
                    subject: subId, 
                    status: 'published',
                    'watchProgress.student': studentId 
                }).select('watchProgress').lean().catch(() => []);
                
                let completedVideos = 0;
                (watchProgressRaw || []).forEach(v => {
                    if (v && v.watchProgress && Array.isArray(v.watchProgress)) {
                        const p = v.watchProgress.find(progress => progress?.student?.toString() === studentId.toString());
                        if (p && p.watchPercentage >= 90) completedVideos++;
                    }
                });

                const [completedAssignments, completedTests] = await Promise.all([
                    Assignment.countDocuments({ subject: subId, status: 'published', 'submissions.studentId': studentId }).catch(() => 0),
                    Test.countDocuments({ subject: subId, status: 'published', 'submissions.studentId': studentId }).catch(() => 0)
                ]);

                const totalItems = (videosCount || 0) + (assignmentsCount || 0) + (testsCount || 0);
                const completedItems = completedVideos + (completedAssignments || 0) + (completedTests || 0);
                const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
                
                return {
                    _id: subId,
                    name: subject.name || "Unnamed",
                    faculty: subject.faculty || [],
                    progress: progress,
                    stats: {
                        videos: videosCount || 0,
                        assignments: assignmentsCount || 0,
                        tests: testsCount || 0
                    }
                };
            } catch (innerErr) {
                console.error("Individual Subject Error:", innerErr);
                return null;
            }
        }));

        res.status(200).json({ success: true, data: progressionData.filter(Boolean) });
    } catch (error) {
        console.error('PROGRESSION ERROR:', error);
        res.status(200).json({ success: false, crash_message: error.message, stack: error.stack });
    }
});

// @desc    Record student leaving a live class
// @route   POST /api/student/live-classes/:id/leave
const leaveLiveClass = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const studentId = req.user._id;
    const leaveTime = new Date();

    const liveClass = await LiveClass.findById(id);
    if (!liveClass) return res.status(404).json({ message: 'Live class not found' });

    const record = liveClass.attendance.find(a => a.studentId?.toString() === studentId.toString());
    if (!record) return res.status(404).json({ message: 'Attendance record not found' });

    record.leaveTime = leaveTime;

    // Compute total session duration
    if (record.joinTime) {
        record.totalDurationSeconds = Math.round((leaveTime - record.joinTime) / 1000);
    }

    // Compute camera-on and mic-on durations from deviceEvents timeline
    const computeDuration = (events, onType, offType) => {
        let total = 0;
        let lastOnTime = null;
        for (const ev of (events || [])) {
            if (ev.type === onType) lastOnTime = new Date(ev.timestamp);
            else if (ev.type === offType && lastOnTime) {
                total += Math.round((new Date(ev.timestamp) - lastOnTime) / 1000);
                lastOnTime = null;
            }
        }
        if (lastOnTime) total += Math.round((leaveTime - lastOnTime) / 1000);
        return total;
    };

    record.cameraOnDurationSeconds = computeDuration(record.deviceEvents, 'camera_on', 'camera_off');
    record.micOnDurationSeconds    = computeDuration(record.deviceEvents, 'mic_on', 'mic_off');

    liveClass.markModified('attendance');
    await liveClass.save();

    res.status(200).json({ success: true, message: 'Leave time recorded' });
});

// @desc    Record a camera/mic toggle event for a student in a live class
// @route   POST /api/student/live-classes/:id/device-event
const trackDeviceEvent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { type } = req.body;
    const studentId = req.user._id;

    const validTypes = ['camera_on', 'camera_off', 'mic_on', 'mic_off'];
    if (!validTypes.includes(type)) {
        return res.status(400).json({ message: 'Invalid event type' });
    }

    const result = await LiveClass.findOneAndUpdate(
        { _id: id, 'attendance.studentId': studentId },
        { $push: { 'attendance.$.deviceEvents': { type, timestamp: new Date() } } },
        { new: true }
    );

    if (!result) return res.status(404).json({ message: 'Attendance record not found. Join the class first.' });

    res.status(200).json({ success: true, message: `Event "${type}" recorded` });
});

module.exports = {
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
};
