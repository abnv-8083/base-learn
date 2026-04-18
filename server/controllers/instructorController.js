const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Instructor = require('../models/Instructor');
const RecordedClass = require('../models/RecordedClass');
const Batch = require('../models/Batch');
const Notification = require('../models/Notification');
const Assignment = require('../models/Assignment');
const Test = require('../models/Test');
const StudyClass = require('../models/StudyClass');
const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');
const ProfileUpdateRequest = require('../models/ProfileUpdateRequest');
const logAction = require('../utils/logAction');
const sendEmail = require('../utils/sendEmail');
const bcrypt = require('bcryptjs');
const { emitToUser, emitToRole, emitToAll } = require('../utils/socket');

// --- Helper for Chapter Resources ---
const getChapterResource = (chapter, resourceId) => {
    for (const field of ['notes', 'liveNotes', 'dpps', 'pyqs']) {
        const res = chapter[field].find(r => r._id.toString() === resourceId);
        if (res) return { resource: res, field };
    }
    return null;
};

// Get Instructor Dashboard Stats
exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.userId || req.user._id;
        
        // 1. Total Classes & Batches Managed
        const totalClasses = await StudyClass.countDocuments({ instructor: userId });
        
        // Find instructor's subjects
        const SubjectModel = require('../models/Subject');
        const instructorSubjectDocs = await SubjectModel.find({ instructor: userId }).select('_id');
        const instructorSubjectIds = instructorSubjectDocs.map(s => s._id);

        // Find batches where instructor is the primary OR teaches a subject
        const instructorBatches = await Batch.find({ 
            $or: [
                { instructor: userId },
                { assignedSubjects: { $in: instructorSubjectIds } }
            ]
        }).select('students');
        
        const totalBatches = instructorBatches.length;

        // 2. Total Unique Students in these batches
        const managedStudentsCount = [...new Set(instructorBatches.flatMap(b => b.students.map(s => s.toString())))].length;

        // 3. Pending Verification Count (Aligned with getContentForVerification)
        const ChapterModel = require('../models/Chapter');
        const TestModel = require('../models/Test');
        const AssignmentModel = require('../models/Assignment');
        const RecordedClassModel = require('../models/RecordedClass');
        const FacultyModel = require('../models/Faculty');

        const assignedFaculties = await FacultyModel.find({ assignedInstructor: userId }).distinct('_id');
        const facultyIds = assignedFaculties;

        // Count Videos (pending/draft)
        const pendingVideos = await RecordedClassModel.countDocuments({
            status: 'draft',
            $or: [
                { subject: { $in: instructorSubjectIds } },
                { faculty: { $in: facultyIds } }
            ]
        });

        // Count Resources in Chapters (draft status)
        const chapterQuery = {
            $or: [
                { subject: { $in: instructorSubjectIds } },
                { 'notes.status': 'draft', 'notes.uploadedBy': { $in: facultyIds } },
                { 'liveNotes.status': 'draft', 'liveNotes.uploadedBy': { $in: facultyIds } },
                { 'dpps.status': 'draft', 'dpps.uploadedBy': { $in: facultyIds } },
                { 'pyqs.status': 'draft', 'pyqs.uploadedBy': { $in: facultyIds } }
            ]
        };

        const chapters = await ChapterModel.find(chapterQuery).lean();
        let pendingResourceCount = 0;
        
        chapters.forEach(chap => {
            const isAssignedSubject = instructorSubjectIds.some(sid => sid.equals(chap.subject));
            ['notes', 'liveNotes', 'dpps', 'pyqs'].forEach(field => {
                const resources = chap[field] || [];
                resources.forEach(r => {
                    if (r.status === 'draft') {
                        // Logic same as getContentForVerification
                        if (isAssignedSubject || facultyIds.some(fid => fid.equals(r.uploadedBy))) {
                            pendingResourceCount++;
                        }
                    }
                });
            });
        });

        // Count Assessments (pending/draft)
        const [pendingTests, pendingAssignments] = await Promise.all([
            TestModel.countDocuments({ 
                status: 'draft', 
                $or: [
                    { subject: { $in: instructorSubjectIds } }, 
                    { faculty: { $in: facultyIds } }
                ] 
            }),
            AssignmentModel.countDocuments({ 
                status: 'draft', 
                $or: [
                    { subject: { $in: instructorSubjectIds } }, 
                    { facultyId: { $in: facultyIds } }
                ] 
            })
        ]);

        const totalPendingVerification = pendingVideos + pendingResourceCount + pendingTests + pendingAssignments;

        // Recently Published (Today)
        const publishedToday = await RecordedClassModel.countDocuments({ 
            status: 'published', 
            $or: [
                { subject: { $in: instructorSubjectIds } },
                { faculty: { $in: facultyIds } }
            ],
            publishedAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } 
        }); 

        res.status(200).json({ 
            success: true, 
            data: { 
                totalClasses, 
                totalBatches, 
                totalStudents: managedStudentsCount,
                pendingVerification: totalPendingVerification,
                publishedToday 
            } 
        });
    } catch (error) {
        console.error('[Instructor Dash Stats Error]', error);
        res.status(500).json({ success: false, message: 'Error fetching dashboard stats', error: error.message });
    }
};

// Get Recently Published Videos (across all chapters)
exports.getRecentVideos = async (req, res) => {
    try {
        const recordings = await RecordedClass.find({ status: 'published' })
            .sort({ publishedAt: -1 })
            .limit(20)
            .populate('faculty', 'name email')
            .populate('subject', 'name')
            .populate('chapter', 'name');
        res.status(200).json({ success: true, data: recordings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching recent recordings', error: error.message });
    }
};

// Get Pending Recorded Classes (Lectures & FAQ Sessions)
exports.getPendingRecordedClasses = async (req, res) => {
    try {
        const recordings = await RecordedClass.find({ status: 'draft' })
            .populate('faculty', 'name email')
            .populate('subject', 'name')
            .populate('chapter', 'name');
        res.status(200).json({ success: true, data: recordings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching pending recordings', error: error.message });
    }
};

// Assign Recorded Class (Lecture or FAQ)
exports.assignRecordedClass = async (req, res) => {
    try {
        const { id } = req.params;
        const { batchIds, publishDate } = req.body;
        
        const recording = await RecordedClass.findByIdAndUpdate(
            id,
            {
                status: 'published',
                assignedTo: batchIds,
                publishedAt: publishDate || Date.now()
            },
            { new: true }
        );

        if (recording) {
            await logAction(req, 'Approved Video', `RecordedClass: ${recording.title}`, { targetId: recording._id, targetModel: 'RecordedClass' });
            
            // Notify Faculty Real-time
            emitToUser(recording.faculty.toString(), 'content_status_changed', { 
                id: recording._id, status: 'published', title: recording.title 
            });

            // Notify Students Real-time
            emitToRole('student', 'content_published', { 
                id: recording._id, title: recording.title, type: 'video' 
            });
        }
        res.status(200).json({ success: true, data: recording });
    } catch (error) {
        res.status(500).json({ message: 'Error assigning recorded class', error: error.message });
    }
};

// Reject Recorded Class
exports.rejectRecordedClass = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        
        const recording = await RecordedClass.findByIdAndUpdate(
            id,
            {
                status: 'rejected',
                rejectionReason: reason
            },
            { new: true }
        );

        if (recording) {
            await logAction(req, 'Rejected Video', `RecordedClass: ${recording.title}`, { targetId: recording._id, targetModel: 'RecordedClass' });
            
            // Notify Faculty Real-time
            const facultyIdStr = recording.faculty.toString();
            await Notification.create({
                message: `Recorded Class Rejected: "${recording.title}". Reason: ${reason}`,
                type: 'alert',
                recipient: facultyIdStr,
                sender: req.user.userId
            });

            emitToUser(facultyIdStr, 'content_status_changed', { 
                id: recording._id, status: 'rejected', title: recording.title, reason 
            });
            emitToUser(facultyIdStr, 'badge_refresh', {});
        }

        res.status(200).json({ success: true, data: recording });
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting recorded class', error: error.message });
    }
};

// Get Pending Assessments (Tests & Assignments)
exports.getPendingAssessments = async (req, res) => {
    try {
        const tests = await Test.find({ status: 'draft' }).populate('faculty', 'name email').populate('subject', 'name').lean();
        const assignments = await Assignment.find({ status: 'draft' }).populate('facultyId', 'name email').lean();
        res.status(200).json({ success: true, data: { tests, assignments } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching pending assessments', error: error.message });
    }
};

// Approve & Assign Assessment (Test or Assignment)
exports.approveAssessment = async (req, res) => {
    try {
        const { id, type } = req.params; // type: 'test' or 'assignment'
        const { assignedTo, deadline } = req.body;
        
        let Model = type === 'test' ? Test : Assignment;
        let updateData = {
            status: 'published',
            assignedBatches: assignedTo, 
            assignedBy: req.user.userId,
            publishedAt: Date.now()
        };

        if (type === 'test') {
            updateData.assignedTo = assignedTo; 
            if (deadline) updateData.deadline = deadline;
        } else {
            if (deadline) updateData.deadline = deadline;
        }

        const assessment = await Model.findByIdAndUpdate(id, updateData, { new: true });

        if (assessment) {
            await logAction(req, `Approved ${type.charAt(0).toUpperCase() + type.slice(1)}`, `Title: ${assessment.title}`, { targetId: assessment._id, targetModel: type === 'test' ? 'Test' : 'Assignment' });
            
            const facultyId = assessment.faculty || assessment.facultyId;
            if (facultyId) {
                emitToUser(facultyId.toString(), 'content_status_changed', { 
                    id: assessment._id, status: 'published', title: assessment.title 
                });
            }

            emitToRole('student', 'content_published', { 
                id: assessment._id, title: assessment.title, type 
            });
        }

        res.status(200).json({ success: true, data: assessment });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error approving assessment', error: error.message });
    }
};

// Get Submissions for an Assessment
exports.getAssessmentSubmissions = async (req, res) => {
    try {
        const { id, type } = req.params;
        const Model = type === 'test' ? Test : Assignment;
        console.log(`[INSTRUCTOR-DEBUG] Fetching submissions for ${type} ID: ${id}`);
        const assessment = await Model.findById(id).populate('submissions.studentId', 'name email').lean();
        
        if (!assessment) {
            console.log(`[INSTRUCTOR-DEBUG] Assessment ${id} NOT FOUND`);
            return res.status(404).json({ success: false, message: 'Assessment not found' });
        }
        
        console.log(`[INSTRUCTOR-DEBUG] Found assessment: ${assessment.title}, Submissions count: ${assessment.submissions?.length || 0}`);
        res.status(200).json({ success: true, data: assessment.submissions || [] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching submissions', error: error.message });
    }
};

// Forward Submission to Faculty
exports.forwardSubmissionToFaculty = async (req, res) => {
    try {
        const { id, type, studentId } = req.params;
        const Model = type === 'test' ? Test : Assignment;
        
        const assessment = await Model.findById(id);
        if (!assessment) return res.status(404).json({ message: 'Assessment not found' });
        
        const submission = assessment.submissions.find(s => s.studentId.toString() === studentId);
        if (!submission) return res.status(404).json({ message: 'Submission not found' });
        
        submission.status = 'forwarded';
        submission.forwardedAt = new Date();
        await assessment.save();
        
        // Notify Faculty
        const facultyId = type === 'test' ? assessment.faculty : assessment.facultyId;
        await Notification.create({
            message: `New student submission forwarded for grading: "${assessment.title}"`,
            type: 'info',
            recipient: facultyId,
            sender: req.user.userId
        });

        await logAction(req, 'Forwarded Submission', `Assessment: ${assessment.title}, Student: ${studentId}`, { targetId: id, targetModel: type === 'test' ? 'Test' : 'Assignment' });

        res.status(200).json({ success: true, message: 'Submission forwarded to faculty successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error forwarding submission', error: error.message });
    }
};

// Get Faculties (Available & Implicitly Assigned)
exports.getFaculties = async (req, res) => {
    try {
        const availableFaculties = await Faculty.find({ role: 'faculty', isActive: true }).select('-password');
        
        // Find implicitly assigned faculties based on content linked to instructor's areas
        const subjects = await Subject.find({ instructor: req.user.userId });
        const subjectIds = subjects.map(s => s._id);
        
        const chapters = await Chapter.find({ subject: { $in: subjectIds } });
        const chapterIds = chapters.map(c => c._id);
        
        const classes = await StudyClass.find({ instructor: req.user.userId });
        const classIds = classes.map(c => c._id);

        const recordedClasses = await RecordedClass.find({ chapter: { $in: chapterIds } }).select('faculty');
        const tests = await Test.find({ subject: { $in: subjectIds } }).select('faculty');
        const assignments = await Assignment.find({ assignedClasses: { $in: classIds } }).select('facultyId');
        
        const assignedSet = new Set();
        recordedClasses.forEach(r => { if(r.faculty) assignedSet.add(r.faculty.toString()) });
        tests.forEach(t => { if(t.faculty) assignedSet.add(t.faculty.toString()) });
        assignments.forEach(a => { if(a.facultyId) assignedSet.add(a.facultyId.toString()) });
        
        const assignedFaculties = availableFaculties.filter(f => assignedSet.has(f._id.toString()));
        
        res.status(200).json({ success: true, data: { available: availableFaculties, assigned: assignedFaculties } });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching faculties', error: error.message });
    }
};

// Get Students (in instructor's batches, or all if full access)
exports.getStudents = async (req, res) => {
    try {
        const students = await Student.find({}).select('-password');
        res.status(200).json({ success: true, data: students });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching students', error: error.message });
    }
};

// Get Student Analysis
exports.getStudentAnalysis = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Student.findById(id).select('-password');
        if (!student) return res.status(404).json({ message: 'Student not found' });
        
        const assignments = await Assignment.find({ 'submissions.studentId': id }).lean();
        const tests = await Test.find({ 'submissions.studentId': id }).lean();
        
        const RecordedClass = require('../models/RecordedClass');
        const recordedClassesRaw = await RecordedClass.find({ "watchProgress.student": id }).select('title contentType watchProgress').lean();
        const recordedClasses = recordedClassesRaw.map(v => {
            const progress = v.watchProgress.find(p => p.student?.toString() === id);
            return { _id: v._id, title: v.title, type: v.contentType, progress };
        });

        const LiveClass = require('../models/LiveClass');
        const liveClassesRaw = await LiveClass.find({ "attendance.studentId": id }).select('title status scheduledAt duration attendance').lean();
        const liveClasses = liveClassesRaw.map(l => {
             const att = l.attendance.find(a => a.studentId === id);
             return { _id: l._id, title: l.title, scheduledAt: l.scheduledAt, duration: l.duration, status: l.status, attendance: att };
        });
        
        res.status(200).json({ success: true, data: { student, assignments, tests, recordedClasses, liveClasses } });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching student analysis', error: error.message });
    }
};

// Add Student Note
exports.addStudentNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { note } = req.body;
        const student = await Student.findByIdAndUpdate(
            id,
            { $push: { instructorNotes: { note } } },
            { new: true }
        ).select('-password');

        if (student) {
            await logAction(req, 'Added Student Note', `Student: ${student.name}`, { targetId: student._id, targetModel: 'Student', details: { note } });
        }

        res.status(200).json({ success: true, data: student });
    } catch (error) {
        res.status(500).json({ message: 'Error adding student note', error: error.message });
    }
};

// [Removed Duplicate getBatchesByClass - see line 889]

// Get Batches
exports.getBatches = async (req, res) => {
    try {
        const { managed } = req.query;
        let query = {}; 
        
        // If managed is true, only return batches where this user is the primary instructor
        if (managed === 'true' && req.user.role !== 'admin') {
            query.instructor = req.user.userId;
        }

        const batches = await Batch.find(query)
            .populate('students', 'name email')
            .populate('instructor', 'name')
            .populate('studyClass', 'name targetGrade');
        res.status(200).json({ success: true, data: batches });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching batches', error: error.message });
    }
};

// Get Single Batch
exports.getBatch = async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id)
            .populate('students', 'name email phone studentClass isActive')
            .populate('instructor', 'name email')
            .populate('studyClass', 'name targetGrade');

        if (!batch) {
            return res.status(404).json({ success: false, message: 'Batch not found' });
        }

        // Basic permission check: only the assigned instructor or admin can get batch details
        const instructorId = batch.instructor?._id ? batch.instructor._id.toString() : batch.instructor?.toString();
        if (instructorId !== req.user.userId.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Unauthorized access to this batch' });
        }

        res.status(200).json({ success: true, data: batch });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching batch details', error: error.message });
    }
};

// Create Batch
exports.createBatch = async (req, res) => {
    try {
        const { name, studyClass, capacity } = req.body;
        const batch = new Batch({
            name,
            studyClass,
            instructor: req.user.userId,
            students: [],
            capacity: capacity || 30
        });
        await batch.save();
        
        // Populate studyClass so frontend updates seamlessly
        const populatedBatch = await Batch.findById(batch._id).populate('studyClass', 'name targetGrade');
        res.status(201).json({ success: true, data: populatedBatch });
    } catch (error) {
        res.status(500).json({ message: 'Error creating batch', error: error.message });
    }
};

// Update Batch Students
exports.updateBatchStudents = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, studentId } = req.body; // action: 'add' or 'remove'
        
        const update = action === 'add' 
            ? { $addToSet: { students: studentId } } 
            : { $pull: { students: studentId } };
            
        const batch = await Batch.findByIdAndUpdate(id, update, { new: true }).populate('students', 'name email');
        res.status(200).json({ success: true, data: batch });
    } catch (error) {
        res.status(500).json({ message: 'Error updating batch students', error: error.message });
    }
};

// Send Notification
exports.sendNotification = async (req, res) => {
    try {
        const { message, recipient, type } = req.body;
        const notification = new Notification({
            message,
            recipient,
            type,
            sender: req.user.userId
        });
        await notification.save();
        res.status(201).json({ success: true, data: notification });
    } catch (error) {
        res.status(500).json({ message: 'Error sending notification', error: error.message });
    }
};

// --- Subject Batch Assignments --- //

exports.getBatchSubjects = async (req, res) => {
    try {
        const { id } = req.params; // batch id
        const userId = req.user.userId || req.user._id;
        
        // Find all subjects (if admin, see all. if instructor, see assigned)
        const query = req.user.role === 'admin' ? {} : { instructor: userId };
        const allSubjects = await Subject.find(query).lean();
        
        // Mark which ones are assigned to this batch
        const result = allSubjects.map(sub => ({
            ...sub,
            isAssigned: sub.assignedTo?.some(bid => bid.toString() === id.toString()) || false
        }));
        
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching batch subjects', error: error.message });
    }
};

exports.updateBatchSubjects = async (req, res) => {
    try {
        const { id } = req.params; // batch id
        const { subjectIds } = req.body; // array of subject ids to be assigned
        const userId = req.user.userId || req.user._id;

        // 1. Remove this batch from ALL subjects where it might be assigned
        await Subject.updateMany(
            { assignedTo: id },
            { $pull: { assignedTo: id } }
        );

        // 2. Add this batch to the newly selected subjects
        if (subjectIds && subjectIds.length > 0) {
            await Subject.updateMany(
                { _id: { $in: subjectIds } },
                { $addToSet: { assignedTo: id } }
            );
        }

        await logAction(req, 'Updated Batch Subjects', `Batch: ${id}`, { targetId: id, targetModel: 'Batch', subjectCount: subjectIds?.length || 0 });
        res.status(200).json({ success: true, message: 'Batch subjects updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating batch subjects', error: error.message });
    }
};

// --- Chapter Resource Approvals ---

exports.getPendingChapterResources = async (req, res) => {
    try {
        console.log('DEBUG: Fetching pending for instructor:', req.user.userId || req.user._id);
        const userId = req.user.userId || req.user._id;
        const subjectQuery = req.user.role === 'admin' ? {} : { instructor: userId };
        const instructorSubjects = await Subject.find(subjectQuery).select('_id');
        const subjectIds = instructorSubjects.map(s => s._id);
        console.log('DEBUG: Found subject IDs:', subjectIds);

        const chapters = await Chapter.find({
            subject: { $in: subjectIds },
            $or: [
                { 'notes.status': 'draft' },
                { 'liveNotes.status': 'draft' },
                { 'dpps.status': 'draft' },
                { 'pyqs.status': 'draft' }
            ]
        }).populate('subject', 'name').populate('notes.uploadedBy liveNotes.uploadedBy dpps.uploadedBy pyqs.uploadedBy', 'name email');

        const pending = [];
        chapters.forEach(chap => {
            ['notes', 'liveNotes', 'dpps', 'pyqs'].forEach(field => {
                const draftResources = chap[field].filter(r => r.status === 'draft');
                draftResources.forEach(r => {
                    pending.push({
                        _id: r._id,
                        title: r.title,
                        url: r.url,
                        description: r.description,
                        uploadedBy: r.uploadedBy,
                        uploadedAt: r.uploadedAt,
                        chapterId: chap._id,
                        chapterName: chap.name,
                        subjectName: chap.subject?.name,
                        type: field.replace('s', '') // note, liveNote, dpp, pyq
                    });
                });
            });
        });

        res.status(200).json({ success: true, data: pending });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pending chapter resources', error: error.message });
    }
};

exports.getRecentChapterResources = async (req, res) => {
    try {
        const Subject = require('../models/Subject');
        const userId = req.user.userId || req.user._id;
        const subjectQuery = req.user.role === 'admin' ? {} : { instructor: userId };
        const subjects = await Subject.find(subjectQuery);
        const subjectIds = subjects.map(s => s._id);

        const chapters = await Chapter.find({ subject: { $in: subjectIds } })
            .populate('subject', 'name');

        let recent = [];
        const fields = ['notes', 'liveNotes', 'dpps', 'pyqs'];

        chapters.forEach(chap => {
            fields.forEach(field => {
                chap[field].forEach(r => {
                    if (r.status === 'published') {
                        recent.push({
                            _id: r._id,
                            title: r.title,
                            url: r.url,
                            description: r.description,
                            uploadedBy: r.uploadedBy,
                            uploadedAt: r.uploadedAt,
                            publishedAt: r.publishedAt || r.uploadedAt, // Fallback for legacy items
                            chapterId: chap._id,
                            chapterName: chap.name,
                            subjectName: chap.subject?.name,
                            type: field.replace('s', '') // note, liveNote, dpp, pyq
                        });
                    }
                });
            });
        });

        // Sort by publishedAt DESC and take top 20
        recent.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
        recent = recent.slice(0, 20);

        res.status(200).json({ success: true, data: recent });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching recent resources', error: error.message });
    }
};

exports.approveChapterResource = async (req, res) => {
    try {
        const { chapterId, resourceId } = req.params;
        const { batchIds } = req.body;

        const chapter = await Chapter.findById(chapterId);
        if (!chapter) return res.status(404).json({ message: 'Chapter not found' });

        const result = getChapterResource(chapter, resourceId);
        if (!result) return res.status(404).json({ message: 'Resource not found' });

        result.resource.status = 'published';
        result.resource.publishedAt = Date.now();
        result.resource.assignedTo = batchIds;

        // Auto-assign parent chapter to these batches as well
        batchIds.forEach(bid => {
            if (!chapter.assignedTo.includes(bid)) {
                chapter.assignedTo.push(bid);
            }
        });

        await chapter.save();

        // Also ensure the Subject is assigned to these batches
        const Subject = require('../models/Subject');
        await Subject.findByIdAndUpdate(chapter.subject, {
            $addToSet: { assignedTo: { $each: batchIds } }
        });

        await logAction(req, 'Approved Chapter Resource', `Title: ${result.resource.title}`, { targetId: resourceId, targetModel: 'Chapter' });
        res.status(200).json({ success: true, message: 'Resource approved successfully', data: result.resource });
    } catch (error) {
        res.status(500).json({ message: 'Error approving chapter resource', error: error.message });
    }
};

exports.rejectChapterResource = async (req, res) => {
    try {
        const { chapterId, resourceId } = req.params;
        const { reason } = req.body;

        const chapter = await Chapter.findById(chapterId);
        if (!chapter) return res.status(404).json({ message: 'Chapter not found' });

        const result = getChapterResource(chapter, resourceId);
        if (!result) return res.status(404).json({ message: 'Resource not found' });

        result.resource.status = 'rejected';
        result.resource.rejectionReason = reason;
        await chapter.save();

        // Notify Faculty
        await Notification.create({
            message: `Resource Rejected: "${result.resource.title}". Reason: ${reason}`,
            type: 'alert',
            recipient: result.resource.uploadedBy,
            sender: req.user.userId
        });

        await logAction(req, 'Rejected Chapter Resource', `Title: ${result.resource.title}`, { targetId: resourceId, targetModel: 'Chapter' });
        res.status(200).json({ success: true, message: 'Resource rejected', data: result.resource });
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting chapter resource', error: error.message });
    }
};

// --- Content Verification Queue (Unified) --- //

exports.getContentForVerification = async (req, res) => {
    try {
        const { status } = req.query; // 'all', 'pending', 'approved', 'rejected'
        const userId = req.user.userId || req.user._id;
        const Subject = require('../models/Subject');
        const Chapter = require('../models/Chapter');
        const RecordedClass = require('../models/RecordedClass');
        const LiveClass = require('../models/LiveClass');

        const subjectQuery = req.user.role === 'admin' ? {} : { instructor: userId };
        const instructorSubjects = await Subject.find(subjectQuery).select('_id name');
        const subjectIds = instructorSubjects.map(s => s._id);

        const facultyQuery = req.user.role === 'admin' ? {} : { assignedInstructor: userId };
        const assignedFaculties = await Faculty.find(facultyQuery).select('_id');
        const facultyIds = assignedFaculties.map(f => f._id);

        const dbStatus = status === 'pending' ? 'draft' : (status === 'approved' ? 'published' : (status === 'rejected' ? 'rejected' : (status === 'deletion' ? 'pending_delete' : null)));

        // Get Videos
        let videoQuery = req.user.role === 'admin' ? {} : {
            $or: [
                { subject: { $in: subjectIds } },
                { faculty: { $in: facultyIds } }
            ]
        };
        if (dbStatus) videoQuery.status = dbStatus;
        if (status === 'all') videoQuery.status = { $in: ['draft', 'published', 'rejected'] };

        const videos = await RecordedClass.find(videoQuery)
            .populate('faculty', 'name')
            .populate('subject', 'name')
            .lean();

        // Get Chapters to extract resources
        const chapterQuery = req.user.role === 'admin' ? {} : {
            $or: [
                { subject: { $in: subjectIds } },
                { 'notes.uploadedBy': { $in: facultyIds } },
                { 'liveNotes.uploadedBy': { $in: facultyIds } },
                { 'dpps.uploadedBy': { $in: facultyIds } },
                { 'pyqs.uploadedBy': { $in: facultyIds } }
            ]
        };

        const chapters = await Chapter.find(chapterQuery)
            .populate('subject', 'name')
            .populate('notes.uploadedBy liveNotes.uploadedBy dpps.uploadedBy pyqs.uploadedBy', 'name');

        let allContent = [];

        videos.forEach(v => {
            allContent.push({
                _id: v._id,
                title: v.title,
                thumbnail: v.thumbnail,
                url: v.videoUrl, // Pass URL for frontend preview
                assignmentUrl: v.assignmentUrl, // Associated exercise PDF
                assignedTo: v.assignedTo || [],
                type: 'video',
                createdAt: v.createdAt || v.publishedAt,
                faculty: v.faculty || { name: 'Unknown' },
                subject: v.subject || { name: 'Unknown' },
                approvalStatus: v.status === 'draft' ? 'pending' : (v.status === 'published' ? 'approved' : v.status),
                itemModel: 'RecordedClass'
            });
        });

        chapters.forEach(chap => {
            ['notes', 'liveNotes', 'dpps', 'pyqs'].forEach(field => {
                let resources = chap[field];
                if (dbStatus) {
                    resources = resources.filter(r => r.status === dbStatus);
                } else if (status === 'all') {
                    resources = resources.filter(r => ['draft', 'published', 'rejected'].includes(r.status));
                }

                // If not admin, and chapter is outside assigned subjects, strictly filter to assigned faculty resources
                if (req.user.role !== 'admin' && !subjectIds.some(sid => sid.equals(chap.subject?._id || chap.subject))) {
                    resources = resources.filter(r => facultyIds.some(fid => fid.equals(r.uploadedBy?._id || r.uploadedBy)));
                }

                resources.forEach(r => {
                    allContent.push({
                        _id: r._id,
                        title: r.title,
                        url: r.url, // Pass URL for frontend preview
                        assignedTo: r.assignedTo || [],
                        type: field.replace('s', ''), // note, liveNote, dpp, pyq
                        createdAt: r.uploadedAt,
                        faculty: r.uploadedBy || { name: 'Unknown' },
                        subject: chap.subject || { name: 'Unknown' },
                        approvalStatus: r.status === 'draft' ? 'pending' : (r.status === 'published' ? 'approved' : r.status.replace('_', ' ')),
                        itemModel: 'ChapterResource',
                        chapterId: chap._id,
                        resourceField: field
                    });
                });
            });
        });

        // Get Tests
        let testQuery = req.user.role === 'admin' ? {} : {
            $or: [
                { subject: { $in: subjectIds } },
                { faculty: { $in: facultyIds } }
            ]
        };
        if (dbStatus) testQuery.status = dbStatus;
        if (status === 'all') testQuery.status = { $in: ['draft', 'published', 'rejected'] };

        const tests = await Test.find(testQuery).populate('faculty', 'name').populate('subject', 'name').lean();
        tests.forEach(t => {
            allContent.push({
                _id: t._id,
                title: t.title,
                url: t.fileUrl,
                assignedTo: t.assignedTo || [],
                type: 'test',
                createdAt: t.createdAt,
                faculty: t.faculty || { name: 'Unknown' },
                subject: t.subject || { name: 'Unknown' },
                approvalStatus: t.status === 'draft' ? 'pending' : (t.status === 'published' ? 'approved' : t.status.replace('_', ' ')),
                itemModel: 'Test'
            });
        });

        // Get Assignments
        let asgQuery = req.user.role === 'admin' ? {} : {
            $or: [
                { subject: { $in: subjectIds } },
                { facultyId: { $in: facultyIds } }
            ]
        };
        if (dbStatus) asgQuery.status = dbStatus;
        if (status === 'all') asgQuery.status = { $in: ['draft', 'published', 'rejected'] };

        const assignments = await Assignment.find(asgQuery).populate('facultyId', 'name').populate('subject', 'name').lean();
        assignments.forEach(a => {
            allContent.push({
                _id: a._id,
                title: a.title,
                url: a.fileUrl,
                assignedTo: a.assignedBatches || [],
                type: 'assignment',
                createdAt: a.createdAt,
                faculty: a.facultyId || { name: 'Unknown' },
                subject: a.subject || { name: 'Unknown' },
                approvalStatus: a.status === 'draft' ? 'pending' : (a.status === 'published' ? 'approved' : a.status.replace('_', ' ')),
                itemModel: 'Assignment'
            });
        });

        // Get Live Classes
        let liveQuery = req.user.role === 'admin' ? {} : {
            $or: [
                { subject: { $in: subjectIds } },
                { faculty: { $in: facultyIds } }
            ]
        };
        // For Live Classes, status can be any of the live class states
        if (dbStatus) {
             if (dbStatus === 'published') liveQuery.status = { $in: ['upcoming', 'ongoing', 'completed'] };
             else liveQuery.status = dbStatus;
        }

        const liveClasses = await LiveClass.find(liveQuery).populate('faculty', 'name').populate('batches', 'name').lean();
        liveClasses.forEach(l => {
            allContent.push({
                _id: l._id,
                title: l.title,
                url: l.meetingLink,
                assignedTo: l.batches || [],
                type: 'live',
                createdAt: l.createdAt,
                faculty: l.faculty || { name: 'Unknown' },
                subject: { name: l.subject },
                approvalStatus: l.status,
                itemModel: 'LiveClass'
            });
        });

        // Sort by date newest first
        allContent.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.status(200).json({ success: true, data: allContent });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching content', error: error.message });
    }
};

exports.updateContentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { approvalStatus, itemModel, chapterId, batchIds, rejectionReason, deadline, maxMarks } = req.body; 
        const dbStatus = approvalStatus === 'approved' ? 'published' : approvalStatus; // approve -> published, reject -> rejected
        
        let updateOps = { status: dbStatus };
        if (rejectionReason) updateOps.rejectionReason = rejectionReason;
        if (deadline) updateOps.deadline = new Date(deadline);
        if (maxMarks) updateOps.maxMarks = Number(maxMarks);
        if (chapterId) updateOps.chapter = chapterId;

        if (dbStatus === 'published' && batchIds && batchIds.length > 0) {
            updateOps.$addToSet = { assignedTo: { $each: batchIds } };
            // For Assignments, use assignedBatches
            if (itemModel === 'Assignment') {
                updateOps.$addToSet = { assignedBatches: { $each: batchIds } };
            }
        }

        let contentObj;
        if (itemModel === 'RecordedClass') {
            contentObj = await RecordedClass.findByIdAndUpdate(id, updateOps, { new: true });
        } else if (itemModel === 'Test') {
            contentObj = await Test.findByIdAndUpdate(id, updateOps, { new: true });
        } else if (itemModel === 'Assignment') {
            contentObj = await Assignment.findByIdAndUpdate(id, updateOps, { new: true });
        } else if (itemModel === 'LiveClass') {
            // Update batches for LiveClass
            if (batchIds && batchIds.length > 0) {
                 updateOps.batches = batchIds;
            }
            contentObj = await LiveClass.findByIdAndUpdate(id, updateOps, { new: true });
        } else if (itemModel === 'ChapterResource') {
            const chapter = await Chapter.findById(chapterId);
            if (chapter) {
                let foundResource = null;
                for (const field of ['notes', 'liveNotes', 'dpps', 'pyqs']) {
                    foundResource = chapter[field].find(r => r._id.toString() === id);
                    if (foundResource) {
                        foundResource.status = dbStatus;
                        if (rejectionReason) foundResource.rejectionReason = rejectionReason;
                        if (dbStatus === 'published') {
                            foundResource.publishedAt = Date.now();
                            if (batchIds && batchIds.length > 0) {
                                foundResource.assignedTo = [...new Set([...(foundResource.assignedTo || []), ...batchIds])];
                                chapter.assignedTo = [...new Set([...(chapter.assignedTo || []), ...batchIds])];
                            }
                        }
                        break;
                    }
                }
                if (foundResource) {
                    await chapter.save();
                    contentObj = foundResource;
                }
            }
        }

        // Notify Faculty if rejected
        if (approvalStatus === 'rejected' && contentObj) {
            const facultyId = contentObj.faculty || contentObj.facultyId || contentObj.uploadedBy;
            if (facultyId) {
                await Notification.create({
                    message: `Content Rejected: "${contentObj.title}". Reason: ${rejectionReason}`,
                    type: 'alert',
                    recipient: facultyId,
                    sender: req.user.userId
                });
            }
        }

        res.status(200).json({ success: true, message: `Content ${approvalStatus}` });

        // --- POST-RESPONSE LOGIC: Sync parent Subject assignment ---
        if (dbStatus === 'published' && batchIds && batchIds.length > 0 && contentObj) {
            try {
                let subjectId;
                if (itemModel === 'ChapterResource') {
                    const chapter = await Chapter.findById(chapterId);
                    subjectId = chapter?.subject;
                } else {
                    subjectId = contentObj.subject;
                }

                if (subjectId) {
                    await Subject.findByIdAndUpdate(subjectId, {
                        $addToSet: { assignedTo: { $each: batchIds } }
                    });
                    console.log(`[SYNC-SUCCESS] Subject ${subjectId} linked to batches: ${batchIds}`);
                }
            } catch (syncErr) {
                console.error('[SYNC-ERROR] Failed to link subject to batches:', syncErr.message);
            }
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating content status', error: error.message });
    }
};

exports.updateAssignedContent = async (req, res) => {
    try {
        const { id } = req.params;
        const { itemModel, chapterId, title, description, batchIds } = req.body;

        const updateData = { title, description };
        if (batchIds) {
            updateData.assignedTo = batchIds;
            if (itemModel === 'Assignment') updateData.assignedBatches = batchIds;
        }

        if (itemModel === 'RecordedClass') {
            await RecordedClass.findByIdAndUpdate(id, updateData);
        } else if (itemModel === 'Test') {
            await Test.findByIdAndUpdate(id, updateData);
        } else if (itemModel === 'Assignment') {
            await Assignment.findByIdAndUpdate(id, updateData);
        } else if (itemModel === 'LiveClass') {
            if (batchIds) updateData.batches = batchIds;
            await LiveClass.findByIdAndUpdate(id, updateData);
        } else if (itemModel === 'ChapterResource') {
            const chapter = await Chapter.findById(chapterId);
            if (chapter) {
                for (const field of ['notes', 'liveNotes', 'dpps', 'pyqs']) {
                    const r = chapter[field].find(res => res._id.toString() === id);
                    if (r) {
                        r.title = title || r.title;
                        r.description = description || r.description;
                        if (batchIds) r.assignedTo = batchIds;
                        break;
                    }
                }
                await chapter.save();
            }
        }
        res.status(200).json({ success: true, message: 'Content updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating content', error: error.message });
    }
};

exports.deleteAssignedContent = async (req, res) => {
    try {
        const { id } = req.params;
        const { itemModel, chapterId } = req.query;

        if (itemModel === 'RecordedClass') {
            await RecordedClass.findByIdAndDelete(id);
        } else if (itemModel === 'Test') {
            await Test.findByIdAndDelete(id);
        } else if (itemModel === 'Assignment') {
            await Assignment.findByIdAndDelete(id);
        } else if (itemModel === 'LiveClass') {
            await LiveClass.findByIdAndDelete(id);
        } else if (itemModel === 'ChapterResource') {
            const chapter = await Chapter.findById(chapterId);
            if (chapter) {
                for (const field of ['notes', 'liveNotes', 'dpps', 'pyqs']) {
                    const r = chapter[field].find(res => res._id.toString() === id);
                    if (r) {
                        chapter[field].pull(id);
                        break;
                    }
                }
                await chapter.save();
            }
        }
        res.status(200).json({ success: true, message: 'Content deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting content', error: error.message });
    }
};

// --- Class Management Additions --- //

exports.getStudyClasses = async (req, res) => {
    try {
        const classes = await StudyClass.find({}).sort({ targetGrade: 1 });
        res.status(200).json({ success: true, data: classes });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching classes', error: error.message });
    }
};



exports.createStudyClass = async (req, res) => {
    try {
        const { name, targetGrade } = req.body;
        const studyClass = new StudyClass({
            name,
            targetGrade,
            instructor: req.user.userId
        });
        await studyClass.save();
        res.status(201).json({ success: true, data: studyClass });
    } catch (error) {
        res.status(500).json({ message: 'Error creating class', error: error.message });
    }
};

exports.moveStudentBatch = async (req, res) => {
    try {
        const { studentId, fromBatchId, toBatchId } = req.body;
        
        await Batch.findByIdAndUpdate(fromBatchId, { $pull: { students: studentId } });
        const newBatch = await Batch.findByIdAndUpdate(toBatchId, { $addToSet: { students: studentId } }, { new: true }).populate('students', 'name email').populate('studyClass', 'name targetGrade');
        
        res.status(200).json({ success: true, message: "Student moved successfully", data: newBatch });
    } catch (error) {
        res.status(500).json({ message: 'Error moving student', error: error.message });
    }
};

exports.updateStudyClass = async (req, res) => {
    try {
        const studyClass = await StudyClass.findById(req.params.id);
        if (!studyClass || studyClass.instructor.toString() !== req.user.userId.toString()) {
            return res.status(404).json({ message: 'Study Class not found or unauthorized' });
        }
        studyClass.name = req.body.name || studyClass.name;
        studyClass.targetGrade = req.body.targetGrade || studyClass.targetGrade;
        const updated = await studyClass.save();
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ message: 'Server error updating class', error: error.message });
    }
};

exports.deleteStudyClass = async (req, res) => {
    try {
        const studyClass = await StudyClass.findById(req.params.id);
        if (!studyClass || studyClass.instructor.toString() !== req.user.userId.toString()) {
            return res.status(404).json({ message: 'Study Class not found or unauthorized' });
        }
        
        const batchCount = await Batch.countDocuments({ studyClass: studyClass._id });
        if (batchCount > 0) {
            return res.status(400).json({ message: 'Cannot delete class with active batches' });
        }

        await StudyClass.deleteOne({ _id: studyClass._id });
        res.status(200).json({ success: true, message: 'Study Class deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting class', error: error.message });
    }
};

exports.updateBatch = async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id);
        if (!batch || batch.instructor.toString() !== req.user.userId.toString()) {
            return res.status(404).json({ message: 'Batch not found or unauthorized' });
        }
        batch.name = req.body.name || batch.name;
        batch.capacity = req.body.capacity || batch.capacity;
        const updated = await batch.save();
        
        // Return populated so frontend updates seamlessly
        const populatedBatch = await Batch.findById(updated._id).populate('students', 'name email').populate('studyClass', 'name targetGrade');
        res.status(200).json({ success: true, data: populatedBatch });
    } catch (error) {
        res.status(500).json({ message: 'Server error updating batch', error: error.message });
    }
};

exports.deleteBatch = async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id);
        if (!batch || batch.instructor.toString() !== req.user.userId.toString()) {
            return res.status(404).json({ message: 'Batch not found or unauthorized' });
        }

        if (batch.students && batch.students.length > 0) {
            return res.status(400).json({ message: 'Cannot delete a batch containing students. Reassign students first.' });
        }

        await Batch.deleteOne({ _id: batch._id });
        res.status(200).json({ success: true, message: 'Batch deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting batch', error: error.message });
    }
};

// --- Student Management --- //

exports.getStudents = async (req, res) => {
    try {
        const students = await Student.find({ role: 'student' }).sort({ name: 1 });
        res.status(200).json({ success: true, data: students });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching students', error: error.message });
    }
};

exports.updateStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student || student.role !== 'student') {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        const { name, email, phone, parentName, parentPhone, school, studentClass } = req.body;
        if (name) student.name = name;
        if (email) student.email = email;
        if (phone !== undefined) student.phone = phone;
        if (parentName !== undefined) student.parentName = parentName;
        if (parentPhone !== undefined) student.parentPhone = parentPhone;
        if (school !== undefined) student.school = school;
        if (studentClass !== undefined) student.studentClass = studentClass;

        const updatedStudent = await student.save();

        await logAction(req, 'Updated Student', `Student: ${updatedStudent.name}`, { targetId: updatedStudent._id, targetModel: 'Student' });
        res.status(200).json({ success: true, data: updatedStudent });
    } catch (error) {
        res.status(500).json({ message: 'Error updating student', error: error.message });
    }
};

exports.createStudent = async (req, res) => {
    try {
        const { name, email, password, studentClass, phone, parentName, parentPhone, school, dob, district } = req.body;

        const userExists = await Student.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'Student already exists' });

        const student = new Student({
            name, email, password, studentClass, phone, parentName, parentPhone, school, dob, district,
            isVerified: true, // Instructor created students are pre-verified
            isActive: true
        });

        await student.save();

        // Manual Batch Assignment
        if (req.body.batchId) {
            try {
                const batch = await Batch.findById(req.body.batchId);
                if (batch) {
                    if (!batch.students.includes(student._id)) {
                        batch.students.push(student._id);
                        await batch.save();
                        console.log(`[INSTRUCTOR-BATCH] Manually added student to batch: ${batch.name}`);
                    }
                }
            } catch (err) {
                console.error('Manual batch assignment fail:', err.message);
            }
        }

        // Send Welcome Email
        try {
            const portalUrl = `${req.protocol}://${req.get('host')}`;
            const html = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #4f46e5;">Welcome to Base Learn, ${name}! 👋</h2>
                    <p>Your student account has been created by your Instructor on Base Learn. You can now log in to your student portal.</p>
                    <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
                        <p style="margin: 5px 0;"><strong>Login URL:</strong> <a href="${portalUrl}/login">${portalUrl}/login</a></p>
                        <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                        <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
                    </div>
                    <p style="color: #6b7280; font-size: 14px;">We recommend changing your password after your first login.</p>
                </div>
            `;
            await sendEmail({ email, subject: 'Base Learn: Your Student Account Details', html });
        } catch (emailErr) { console.error('Welcome email failed:', emailErr.message); }

        await logAction(req, 'Created Student', `Student: ${student.name}`, { targetId: student._id, targetModel: 'Student' });
        res.status(201).json({ success: true, data: student });
    } catch (error) {
        res.status(500).json({ message: 'Error creating student', error: error.message });
    }
};

exports.toggleStudentStatus = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        student.isActive = !student.isActive;
        const updatedStudent = await student.save();
        
        const action = updatedStudent.isActive ? 'Activated Student' : 'Blocked Student';
        await logAction(req, action, `Student: ${updatedStudent.name}`, { targetId: updatedStudent._id, targetModel: 'Student', details: { isActive: updatedStudent.isActive } });

        res.status(200).json({ success: true, message: updatedStudent.isActive ? 'Student unblocked' : 'Student blocked', data: { isActive: updatedStudent.isActive } });
    } catch (error) {
        res.status(500).json({ message: 'Error toggling student status', error: error.message });
    }
};

exports.deleteStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        const Batch = require('../models/Batch');
        await Batch.updateMany(
            { students: student._id },
            { $pull: { students: student._id } }
        );

        await logAction(req, 'Removed Student', `Student: ${student.name}`, { targetId: student._id, targetModel: 'Student' });

        await Student.deleteOne({ _id: student._id });
        res.status(200).json({ success: true, message: 'Student deleted successfully and removed from batches' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting student', error: error.message });
    }
};

// --- Assignment Distribution --- //

exports.getAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find({})
            .populate('assignedBatches', 'name')
            .populate('assignedClasses', 'name targetGrade')
            .populate('assignedStudents', 'name email');
        res.status(200).json({ success: true, data: assignments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching assignments', error: error.message });
    }
};

exports.distributeAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const { targetType, targetId, type } = req.body; // targetType: 'batch', 'class', 'student', type: 'test' | 'assignment'
        
        const Model = type === 'test' ? Test : Assignment;
        const assessment = await Model.findById(id);
        if (!assessment) return res.status(404).json({ message: 'Assessment not found' });
        
        let updateField = '';
        if (targetType === 'batch') {
            updateField = type === 'test' ? 'assignedTo' : 'assignedBatches';
        } else if (targetType === 'class') {
            updateField = 'assignedClasses';
        } else if (targetType === 'student') {
            updateField = 'assignedStudents';
        } else {
            return res.status(400).json({ message: 'Invalid target type' });
        }
        
        const updatedAssessment = await Model.findByIdAndUpdate(
            id,
            { $addToSet: { [updateField]: targetId } },
            { new: true }
        )
        .populate(type === 'test' ? 'assignedTo' : 'assignedBatches', 'name')
        .populate('assignedClasses', 'name targetGrade')
        .populate('assignedStudents', 'name email');

        await logAction(req, 'Distributed Assessment', `Title: ${assessment.title}`, { targetId: assessment._id, targetModel: type === 'test' ? 'Test' : 'Assignment', details: { targetType, targetId } });
            
        res.status(200).json({ success: true, data: updatedAssessment });
    } catch (error) {
        res.status(500).json({ message: 'Error distributing assignment', error: error.message });
    }
};

// GET /api/instructor/assessments/:id/:type/submissions
exports.getAssessmentSubmissions = async (req, res) => {
    try {
        const { id, type } = req.params;
        const Model = type === 'test' ? Test : Assignment;
        
        const assessment = await Model.findById(id).populate('submissions.studentId', 'name email').lean();
        if (!assessment) return res.status(404).json({ message: 'Assessment not found' });
        
        // Return only submissions
        res.status(200).json({ success: true, data: assessment.submissions || [] });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching submissions', error: error.message });
    }
};

// POST /api/instructor/assessments/:id/:type/forward/:studentId
exports.forwardSubmissionToFaculty = async (req, res) => {
    try {
        const { id, type, studentId } = req.params;
        const Model = type === 'test' ? Test : Assignment;
        
        const assessment = await Model.findById(id);
        if (!assessment) return res.status(404).json({ message: 'Assessment not found' });
        
        const submission = assessment.submissions.find(s => s.studentId.toString() === studentId);
        if (!submission) return res.status(404).json({ message: 'Submission not found' });
        
        if (submission.status === 'forwarded' || submission.status === 'graded') {
            return res.status(400).json({ message: 'Submission already forwarded or graded' });
        }
        
        submission.status = 'forwarded';
        submission.forwardedAt = new Date();
        
        await assessment.save();
        
        await logAction(req, 'Forwarded Submission', `Assessment: ${assessment.title}, Student ID: ${studentId}`, { targetId: id, targetModel: type === 'test' ? 'Test' : 'Assignment' });
        
        res.status(200).json({ success: true, message: 'Submission forwarded to faculty successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error forwarding submission', error: error.message });
    }
};

// --- Profile Update Requests --- //

exports.requestProfileUpdate = async (req, res) => {
    try {
        const { type, newValue } = req.body;
        
        if (!['email', 'password'].includes(type)) {
            return res.status(400).json({ message: 'Invalid request type.' });
        }

        if (!newValue) {
            return res.status(400).json({ message: 'New value is required.' });
        }

        const pending = await ProfileUpdateRequest.findOne({ userId: req.user.userId, status: 'pending' });
        if (pending) {
            return res.status(400).json({ message: 'You already have a pending profile update request.' });
        }

        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentRequests = await ProfileUpdateRequest.countDocuments({ 
            userId: req.user.userId, 
            createdAt: { $gte: oneWeekAgo } 
        });

        if (recentRequests >= 3) {
            return res.status(400).json({ message: 'You have reached the maximum limit of 3 profile update requests per week.' });
        }

        const request = new ProfileUpdateRequest({
            userId: req.user.userId,
            userModel: req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1),
            type,
            newValue
        });

        await request.save();

        await Notification.create({
            message: `New profile update requested by ${req.user.name || 'Instructor'} (${req.user.role})`,
            type: 'alert',
            recipient: 'all_admins',
            sender: req.user.userId
        });
        res.status(201).json({ success: true, data: request });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting profile update request', error: error.message });
    }
};

// GET /api/instructor/assessments/active
exports.getActiveAssessments = async (req, res) => {
    try {
        const tests = await Test.find({ status: 'published' })
            .populate('subject', 'name')
            .populate('chapter', 'name')
            .populate('assignedTo', 'name')
            .lean();
            
        const assignments = await Assignment.find({ status: 'published' })
            .populate('subject', 'name')
            .populate('chapter', 'name')
            .populate('assignedBatches', 'name')
            .lean();
            
        res.status(200).json({ 
            success: true, 
            data: { 
                tests: tests.map(t => ({...t, assessmentType: 'test'})), 
                assignments: assignments.map(a => ({...a, assessmentType: 'assignment'})) 
            } 
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching active assessments', error: error.message });
    }
};

exports.getPendingProfileRequest = async (req, res) => {
    try {
        const pending = await ProfileUpdateRequest.findOne({ userId: req.user.userId, status: 'pending' });
        res.status(200).json({ success: true, data: pending || null });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pending request', error: error.message });
    }
};

// GET /api/instructor/batches-by-class
exports.getBatchesByClass = async (req, res) => {
    try {
        const { className } = req.query;
        if (!className) return res.status(400).json({ message: 'Class name is required' });

        const studyClass = await StudyClass.findOne({ 
            $or: [{ name: className }, { targetGrade: className }] 
        });
        
        if (!studyClass) return res.status(200).json({ success: true, data: [] });

        // Only return batches managed for this class
        const batches = await Batch.find({ 
            studyClass: studyClass._id
        }).populate('instructor', 'name email');
        
        res.status(200).json({ success: true, data: batches });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching batches', error: error.message });
    }
};

// GET /api/instructor/live-classes
exports.getLiveClasses = async (req, res) => {
    try {
        const userId = req.user.userId || req.user._id;
        const Subject = require('../models/Subject');
        const LiveClass = require('../models/LiveClass');
        const Faculty = require('../models/Faculty');
        const Batch = require('../models/Batch');

        // 1. Get Subject IDs assigned to instructor
        const subjectQuery = req.user.role === 'admin' ? {} : { instructor: userId };
        const instructorSubjects = await Subject.find(subjectQuery).select('_id');
        const subjectIds = instructorSubjects.map(s => s._id);

        // 2. Get Faculty IDs assigned to instructor
        const facultyQuery = req.user.role === 'admin' ? {} : { assignedInstructor: userId };
        const assignedFaculties = await Faculty.find(facultyQuery).select('_id');
        const facultyIds = assignedFaculties.map(f => f._id);

        // 3. Get Batch IDs managed by instructor (NEW: Essential for visibility)
        const managedBatches = await Batch.find({ instructor: userId }).select('_id');
        const managedBatchIds = managedBatches.map(b => b._id);

        const query = req.user.role === 'admin' ? {} : {
            $or: [
                { subject: { $in: subjectIds } },
                { faculty: { $in: facultyIds } },
                { batches: { $in: managedBatchIds } }
            ]
        };

        const classes = await LiveClass.find(query)
            .populate('faculty', 'name email image')
            .populate('batches', 'name')
            .sort({ scheduledAt: -1 });

        // Check for associated recordings and handle legacy string subjects defensively
        const RecordedClass = require('../models/RecordedClass');
        const results = await Promise.all(classes.map(async (cls) => {
            const clsObj = cls.toObject();
            
            // Defensive Populate for Subject (handles legacy string titles)
            if (cls.subject && typeof cls.subject !== 'string' && cls.subject.toString().match(/^[0-9a-fA-F]{24}$/)) {
                try {
                    clsObj.subject = await Subject.findById(cls.subject).select('name');
                } catch (e) {
                    // It's a string title, leave as is
                }
            }

            if (cls.status === 'completed') {
                clsObj.recording = await RecordedClass.findOne({ liveClass: cls._id }).lean();
            }
            return clsObj;
        }));

        res.status(200).json({ success: true, data: results });
    } catch (error) {
        console.error('[Instructor LiveClasses API Error]:', error.message);
        res.status(500).json({ success: false, message: 'Error fetching live classes', error: error.message });
    }
};

// PATCH /api/instructor/live-classes/:id/assign-batches
// Instructor assigns a live class (created by faculty) to one or more batches
exports.assignLiveClassBatches = async (req, res) => {
    try {
        const { id } = req.params;
        const { batchIds } = req.body; // array of batch IDs

        if (!batchIds || !Array.isArray(batchIds)) {
            return res.status(400).json({ message: 'batchIds array is required' });
        }

        const LiveClass = require('../models/LiveClass');
        const liveClass = await LiveClass.findByIdAndUpdate(
            id,
            { $set: { batches: batchIds } },
            { new: true }
        ).populate('faculty', 'name').populate('batches', 'name');

        if (!liveClass) return res.status(404).json({ message: 'Live class not found' });

        await logAction(req, 'Assigned Live Class to Batches', liveClass.title, {
            targetId: id, targetModel: 'LiveClass', details: { batchCount: batchIds.length }
        });

        // Notify faculty
        await Notification.create({
            message: `Your live class "${liveClass.title}" has been assigned to ${batchIds.length} batch(es).`,
            type: 'info',
            recipient: liveClass.faculty._id,
            sender: req.user.userId
        });

        res.status(200).json({ success: true, data: liveClass, message: 'Batches assigned successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error assigning batches to live class', error: error.message });
    }
};

// PATCH /api/instructor/live-classes/:id/assign-recording
// After class ends, instructor publishes the auto-generated recording to the assigned batches
exports.assignLiveClassRecording = async (req, res) => {
    try {
        const { id } = req.params;
        const { recordingUrl, notesUrl } = req.body; // optional URL overrides

        const LiveClass = require('../models/LiveClass');
        const RecordedClass = require('../models/RecordedClass');

        const liveClass = await LiveClass.findById(id).populate('batches', '_id name');
        if (!liveClass) return res.status(404).json({ message: 'Live class not found' });
        if (liveClass.status !== 'completed') {
            return res.status(400).json({ message: 'Live class has not ended yet' });
        }

        const batchIds = liveClass.batches.map(b => b._id);

        // Find or auto-create the recording linked to this live class
        let recording = await RecordedClass.findOne({ liveClass: id });

        if (!recording) {
            // Create one if it does not yet exist
            recording = await RecordedClass.create({
                title: `Recording: ${liveClass.title}`,
                description: `Session conducted on ${new Date(liveClass.scheduledAt).toLocaleDateString()}`,
                subject: liveClass.subject,
                chapter: liveClass.chapter || null,
                faculty: liveClass.faculty,
                liveClass: id,
                contentType: 'liveRecording',
                status: 'draft',
                videoUrl: recordingUrl || liveClass.recordingUrl || 'pending'
            });
        }

        // If a new recording URL was supplied, update it
        if (recordingUrl) {
            recording.videoUrl = recordingUrl;
            recording.recordingUrl = recordingUrl;
        }
        if (notesUrl) {
            recording.assignmentUrl = notesUrl;
        }

        // Publish to batches
        recording.status = 'published';
        recording.assignedTo = batchIds;
        recording.publishedAt = new Date();
        await recording.save();

        // Also update the LiveClass recording URL if provided
        if (recordingUrl) {
            liveClass.recordingUrl = recordingUrl;
            await liveClass.save();
        }

        await logAction(req, 'Published Live Class Recording', liveClass.title, {
            targetId: recording._id, targetModel: 'RecordedClass'
        });

        res.status(200).json({ success: true, data: recording, message: 'Recording published to batches' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error assigning recording', error: error.message });
    }
};

// PATCH /api/instructor/live-classes/:id/assign-notes
// Instructor assigns a notes PDF (presentation slides) to the batches linked to this live class
exports.assignLiveClassNotes = async (req, res) => {
    try {
        const { id } = req.params;
        const { notesUrl } = req.body;

        if (!notesUrl) return res.status(400).json({ message: 'notesUrl is required' });

        const LiveClass = require('../models/LiveClass');
        const liveClass = await LiveClass.findById(id).populate('batches', '_id name').populate('chapter');
        if (!liveClass) return res.status(404).json({ message: 'Live class not found' });

        // Update the presentationUrl on the live class itself
        liveClass.presentationUrl = notesUrl;
        await liveClass.save();

        // If this live class belongs to a chapter, add it as a liveNote resource there
        if (liveClass.chapter) {
            const Chapter = require('../models/Chapter');
            const chapter = await Chapter.findById(liveClass.chapter._id || liveClass.chapter);
            if (chapter) {
                chapter.liveNotes.push({
                    title: `Notes: ${liveClass.title}`,
                    url: notesUrl,
                    uploadedBy: liveClass.faculty,
                    uploadedAt: new Date(),
                    status: 'published',
                    publishedAt: new Date(),
                    assignedTo: liveClass.batches.map(b => b._id)
                });
                await chapter.save();
            }
        }

        await logAction(req, 'Published Live Class Notes', liveClass.title, {
            targetId: id, targetModel: 'LiveClass'
        });

        res.status(200).json({ success: true, message: 'Notes published to batches' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error assigning notes', error: error.message });
    }
};


// GET /api/instructor/live-classes/:id/analytics
exports.getLiveClassAnalytics = async (req, res) => {
    try {
        const { id } = req.params;
        const LiveClass = require('../models/LiveClass');

        const liveClass = await LiveClass.findById(id)
            .populate('attendance.studentId', 'name email phone profilePhoto studentClass')
            .populate('batches', 'name')
            .lean();

        if (!liveClass) return res.status(404).json({ message: 'Live class not found' });

        const fmtSecs = (s) => {
            if (!s || s <= 0) return '0m 0s';
            return `${Math.floor(s / 60)}m ${s % 60}s`;
        };

        const analytics = (liveClass.attendance || []).map(a => {
            const student = a.studentId || {};
            const joinTime = a.joinTime ? new Date(a.joinTime) : null;
            const leaveTime = a.leaveTime ? new Date(a.leaveTime) : null;

            let totalSecs = a.totalDurationSeconds || 0;
            if (!totalSecs && joinTime && leaveTime) {
                totalSecs = Math.round((leaveTime - joinTime) / 1000);
            }

            const camSecs = a.cameraOnDurationSeconds || 0;
            const micSecs = a.micOnDurationSeconds || 0;
            const camPct = totalSecs > 0 ? Math.min(100, Math.round((camSecs / totalSecs) * 100)) : 0;
            const micPct = totalSecs > 0 ? Math.min(100, Math.round((micSecs / totalSecs) * 100)) : 0;

            return {
                studentId: student._id,
                name: student.name || 'Unknown',
                email: student.email,
                profilePhoto: student.profilePhoto || null,
                studentClass: student.studentClass || '—',
                attended: a.attended,
                joinTime: joinTime ? joinTime.toISOString() : null,
                leaveTime: leaveTime ? leaveTime.toISOString() : null,
                totalDurationSeconds: totalSecs,
                totalDurationFormatted: fmtSecs(totalSecs),
                cameraOnDurationSeconds: camSecs,
                cameraOnDurationFormatted: fmtSecs(camSecs),
                cameraEngagementPercent: camPct,
                micOnDurationSeconds: micSecs,
                micOnDurationFormatted: fmtSecs(micSecs),
                micEngagementPercent: micPct,
                deviceTimeline: (a.deviceEvents || []).map(ev => ({
                    type: ev.type,
                    timestamp: ev.timestamp
                }))
            };
        });

        analytics.sort((a, b) => {
            if (a.attended !== b.attended) return b.attended - a.attended;
            return new Date(a.joinTime || 0) - new Date(b.joinTime || 0);
        });

        const attended = analytics.filter(a => a.attended);
        const avg = (arr, key) => arr.length > 0 ? Math.round(arr.reduce((s, a) => s + a[key], 0) / arr.length) : 0;

        res.status(200).json({
            success: true,
            data: {
                liveClass: {
                    _id: liveClass._id,
                    title: liveClass.title,
                    subject: liveClass.subject,
                    scheduledAt: liveClass.scheduledAt,
                    duration: liveClass.duration,
                    status: liveClass.status,
                    batches: liveClass.batches
                },
                summary: {
                    totalEnrolled: analytics.length,
                    attendedCount: attended.length,
                    absentCount: analytics.length - attended.length,
                    attendanceRate: analytics.length > 0 ? Math.round((attended.length / analytics.length) * 100) : 0,
                    avgDurationSeconds: avg(attended, 'totalDurationSeconds'),
                    avgDurationFormatted: fmtSecs(avg(attended, 'totalDurationSeconds')),
                    avgCameraEngagementPercent: avg(attended, 'cameraEngagementPercent'),
                    avgMicEngagementPercent: avg(attended, 'micEngagementPercent')
                },
                students: analytics
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching analytics', error: error.message });
    }
};

// GET /api/instructor/badge-counts
exports.getInstructorBadgeCounts = async (req, res) => {
    try {
        const userId = req.user.userId || req.user._id;
        
        // 1. Get subjects managed by this instructor
        const subjectQuery = req.user.role === 'admin' ? {} : { instructor: userId };
        const instructorSubjects = await Subject.find(subjectQuery).select('_id');
        const subjectIds = instructorSubjects.map(s => s._id);

        // 2. Count pending items in these subjects
        const [pendingVideos, pendingTests, pendingAssignments, pendingLive] = await Promise.all([
            RecordedClass.countDocuments({ status: 'draft', subject: { $in: subjectIds } }),
            Test.countDocuments({ status: 'draft', subject: { $in: subjectIds } }),
            Assignment.countDocuments({ status: 'draft', subject: { $in: subjectIds } }),
            require('../models/LiveClass').countDocuments({ status: 'ongoing', subject: { $in: subjectIds.map(id => id.toString()) } }) // LiveClass subject is often a string or linked differently
        ]);

        // 3. Count pending chapter resources
        const chapters = await Chapter.find({ subject: { $in: subjectIds } }).lean();
        let pendingResources = 0;
        chapters.forEach(chap => {
            ['notes', 'liveNotes', 'dpps', 'pyqs'].forEach(field => {
                pendingResources += (chap[field] || []).filter(r => r.status === 'draft').length;
            });
        });

        // 4. Notifications
        const unreadNotifs = await require('../models/Notification').countDocuments({
            recipient: { $in: [userId, 'all'] },
            dismissedBy: { $ne: userId }
        });

        const pendingContent = pendingVideos + pendingResources;
        const pendingAssessments = pendingTests + pendingAssignments;
        const liveNow = pendingLive;

        res.json({ success: true, data: { pendingContent, pendingAssessments, liveNow, unreadNotifs } });
    } catch (e) {
        console.error('[InstructorBadges] Error:', e.message);
        res.json({ success: true, data: { pendingContent: 0, pendingAssessments: 0, liveNow: 0, unreadNotifs: 0 } });
    }
};

