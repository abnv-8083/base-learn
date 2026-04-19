const asyncHandler = require('express-async-handler');
const path = require('path');
const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');
const RecordedClass = require('../models/RecordedClass');
const Student = require('../models/Student');
const Batch = require('../models/Batch');
const LiveClass = require('../models/LiveClass');
const Assignment = require('../models/Assignment');
const Test = require('../models/Test');
const ProfileUpdateRequest = require('../models/ProfileUpdateRequest');
const Notification = require('../models/Notification');
const logAction = require('../utils/logAction');
const bbb = require('../utils/bbb');
const { uploadToS3, deleteFromS3 } = require('../utils/s3');
const cloudinary = require('cloudinary').v2;
const { emitToUser, emitToRole } = require('../utils/socket');

/**
 * Upload any file to Cloudinary (images, PDFs, documents)
 * Images → resource_type: 'image', PDFs → resource_type: 'raw'
 * Returns the secure_url. Falls back gracefully on error.
 */
const uploadToCloudinary = async (file, folder = 'bl_uploads') => {
    if (!file || !file.path) return null;
    const isPdf = file.mimetype === 'application/pdf' || file.originalname?.toLowerCase().endsWith('.pdf');
    const isImage = file.mimetype?.startsWith('image/');
    
    // If it's a PDF, we bypass Cloudinary/S3 and keep it local
    if (isPdf) {
        console.log('[Cloudinary] Intercepted PDF - Keeping locally on server');
        return null; // Will be handled by formatLocalPath downstream
    }

    try {
        const result = await cloudinary.uploader.upload(file.path, {
            folder,
            resource_type: 'auto',        // 'auto' works for images, PDFs and documents
            access_mode: 'public',
            type: 'upload',
        });
        // Clean up local temp file
        try { require('fs').unlinkSync(file.path); } catch {}
        return result.secure_url;
    } catch (err) {
        console.error('[Cloudinary] Upload failed:', err.message);
        return null;
    }
};



// Helper to format local file paths to relative URLs
// Helper to format local file paths to relative URLs
const formatLocalPath = (req, filePath, fileObj = null) => {
    if (!filePath && !fileObj) return null;
    
    // 1. If we have a file object (from multer-storage-cloudinary), try to get the full URL directly
    const directUrl = fileObj?.path || fileObj?.url || fileObj?.secure_url;
    if (directUrl && directUrl.startsWith('http')) return directUrl;

    const pathToCheck = filePath || directUrl || '';
    
    // 2. If it's already an HTTP URL, keep it
    if (pathToCheck.startsWith('http')) return pathToCheck;
    
    // 3. For local paths, normalize and extract relative public path
    const normalized = pathToCheck.replace(/\\/g, '/');
    const uploadsIndex = normalized.indexOf('/uploads/');
    const relativePath = uploadsIndex !== -1 ? normalized.substring(uploadsIndex) : normalized;
    
    // If it doesn't contain /uploads/ and isn't an HTTP URL, it might be a Cloudinary public ID or raw path
    // We should be careful here. If it contains cloudinary info, it's a Cloudinary path.
    if (uploadsIndex === -1 && !pathToCheck.startsWith('http') && (fileObj?.provider === 'cloudinary' || pathToCheck.includes('bl_'))) {
        // If it's Cloudinary but missing the domain, we have a problem. 
        // We'll return it as is for now but log it.
        console.warn('[formatLocalPath] Cloudinary path missing domain:', pathToCheck);
        return pathToCheck;
    }

    // Prepend server origin - Prefer env override for tunnels
    const origin = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
    return `${origin.replace(/\/$/, '')}${relativePath}`;
};

// GET /api/faculty/dashboard
exports.getDashboardStats = asyncHandler(async (req, res) => {
    const facultyId = req.user.userId;

    // Batches where this faculty teaches (via subjects assigned to batches)
    const mySubjects = await Subject.find({ faculty: facultyId }).select('_id assignedTo');
    const mySubjectIds = mySubjects.map(s => s._id);
    
    // Extract all batch IDs assigned to these subjects
    const myBatches = [...new Set(mySubjects.flatMap(s => s.assignedTo.map(bid => bid.toString())))];

    // Students in those batches
    const batchDocs = await Batch.find({ _id: { $in: myBatches } }).select('students').lean();
    const totalStudents = [...new Set(batchDocs.flatMap(b => b.students.map(s => s.toString())))].length;

    // 1. Pending grading: submitted but not yet graded for this specific faculty's subjects/assigned content
    const [pendingAssignments, pendingTests] = await Promise.all([
        Assignment.countDocuments({ 
            facultyId, 
            'submissions.status': 'submitted' 
        }),
        Test.countDocuments({ 
            faculty: facultyId, 
            'submissions.status': 'submitted' 
        })
    ]);

    // 2. Verified Content: Count of approved/published materials by this faculty
    const chapterModel = require('../models/Chapter');
    const recordedClassModel = require('../models/RecordedClass');
    
    const [verifiedVideos, verifiedTests, verifiedAssignments] = await Promise.all([
        recordedClassModel.countDocuments({ faculty: facultyId, status: 'published' }),
        Test.countDocuments({ faculty: facultyId, status: 'published' }),
        Assignment.countDocuments({ facultyId: facultyId, status: 'published' })
    ]);

    // Count Verified Resources in Chapters
    const chaptersWithResources = await chapterModel.find({
        $or: [
            { 'notes.uploadedBy': facultyId },
            { 'liveNotes.uploadedBy': facultyId },
            { 'dpps.uploadedBy': facultyId },
            { 'pyqs.uploadedBy': facultyId }
        ]
    }).lean();

    let verifiedResourceCount = 0;
    chaptersWithResources.forEach(chap => {
        ['notes', 'liveNotes', 'dpps', 'pyqs'].forEach(field => {
            if (chap[field]) {
                verifiedResourceCount += chap[field].filter(r => r.status === 'published' && r.uploadedBy?.toString() === facultyId.toString()).length;
            }
        });
    });

    const totalVerifiedContent = verifiedVideos + verifiedTests + verifiedAssignments + verifiedResourceCount;

    const upcomingClasses = await LiveClass.countDocuments({ faculty: facultyId, status: 'upcoming' });
    const batchesCount = myBatches.length;

    res.status(200).json({ success: true, data: {
        totalStudents,
        pendingAssessments: pendingAssignments + pendingTests,
        upcomingClasses,
        batches: batchesCount,
        verifiedContent: totalVerifiedContent
    } });
});

// GET /api/faculty/subjects
exports.getAssignedSubjects = asyncHandler(async (req, res) => {
    const facultyUser = await require('../models/Faculty').findById(req.user.userId);
    
    // Fetch subjects explicitly assigned to this faculty
    let subjects = await Subject.find({ faculty: req.user.userId }).lean();
    
    // Implicit fallback: If they have no explicitly assigned subjects, let them see subjects 
    // owned by any of their assigned instructors (to prevent empty dashboard states)
    if (subjects.length === 0 && facultyUser && facultyUser.assignedInstructors?.length > 0) {
        subjects = await Subject.find({ instructor: { $in: facultyUser.assignedInstructors } }).lean();
    }

    const result = await Promise.all(subjects.map(async (sub) => {
        const chapters = await Chapter.find({ subject: sub._id }).select('name').lean();
        return { ...sub, chapters };
    }));
    res.status(200).json({ success: true, data: result });
});

// POST /api/faculty/content/upload
exports.uploadContent = asyncHandler(async (req, res) => {
    const { type, title, description, chapterId, subjectId, isMain } = req.body;
    const isMainAssessment = isMain === 'true' || isMain === true;

    if (!isMainAssessment && !chapterId && (type !== 'faq')) {
        return res.status(400).json({ message: 'Chapter ID is required' });
    }

    if (!title || title.trim() === '') {
        return res.status(400).json({ message: 'Content title is required' });
    }

    // Extraction for multi-field upload (Video + Assignment + Thumbnail) or single file
    const videoFile = req.files?.['file']?.[0] || req.file;
    const assignmentFile = req.files?.['assignment']?.[0];
    const thumbnailFile = req.files?.['thumbnail']?.[0];
    
    if (!videoFile && !assignmentFile) return res.status(400).json({ message: 'At least one file is required.' });

    // Server-side PDF validation for Chapter Resources
    if (['note', 'liveNote', 'dpp', 'pyq', 'test', 'assignment'].includes(type)) {
        const file = videoFile || assignmentFile;
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext !== '.pdf') {
            return res.status(400).json({ message: 'Only PDF files are allowed for chapter resources.' });
        }
    }

    // Helper to notify the assigned instructor when new content is uploaded
    const notifyInstructorAsync = async (contentTitle) => {
        try {
            const subject = await require('../models/Subject').findById(subjectId);
            if (subject && subject.instructor) {
                const instructorId = subject.instructor.toString();
                await require('../models/Notification').create({
                    message: `Faculty uploaded new content pending verification: "${contentTitle}"`,
                    type: 'info',
                    recipient: instructorId,
                    sender: req.user.userId
                });
                // Real-time socket notification
                emitToUser(instructorId, 'content_submitted', { title: contentTitle });
            }
        } catch (err) {
            console.error('[Notify Instructor Error]', err);
        }
    };

    // 1. Upload files:
    // ...
    const filePath = videoFile
        ? (videoFile.mimetype?.startsWith('video/')
            ? await uploadToS3(videoFile, 'videos')
            : formatLocalPath(req, videoFile.path, videoFile))
        : null;
    const assignmentPath = assignmentFile ? formatLocalPath(req, assignmentFile.path, assignmentFile) : null;
    const thumbnailPath  = thumbnailFile  ? await uploadToCloudinary(thumbnailFile, 'bl_thumbnails') : null;

    // 1. Handle FAQ Sessions, Recorded Classes & Live Recordings
    const defaultDeadline = new Date();
    defaultDeadline.setDate(defaultDeadline.getDate() + 7); // Default 7 days

    if (['faq', 'video', 'liveRecording'].includes(type)) {
        let contentType = 'lecture';
        if (type === 'faq') contentType = 'faq';
        else if (type === 'liveRecording') contentType = 'liveRecording';

        const content = await RecordedClass.create({
            title,
            videoUrl: filePath,
            assignmentUrl: assignmentPath,
            thumbnail: thumbnailPath,
            description,
            chapter: chapterId || null,
            subject: subjectId,
            faculty: req.user.userId,
            contentType,
            status: 'draft'
        });

        const logMsg = type === 'faq' ? 'Uploaded FAQ Session' : (type === 'liveRecording' ? 'Uploaded Live Recording' : 'Uploaded Recorded Class');
        await logAction(req, logMsg, title, { targetId: content._id, targetModel: 'RecordedClass' });
        notifyInstructorAsync(title);
        return res.status(201).json({ success: true, message: `${type.replace(/([A-Z])/g, ' $1').trim()} submitted for review`, data: content });
    }

    // 3. Handle Main Test / Main Assignment (Root Level)
    if (isMainAssessment) {
        if (type === 'test') {
            const test = await Test.create({
                title, description, fileUrl: filePath,
                faculty: req.user.userId, subject: subjectId,
                isMain: true, status: 'draft',
                deadline: req.body.deadline ? new Date(req.body.deadline) : defaultDeadline,
                maxMarks: Number(req.body.maxMarks) || 100
            });
            await logAction(req, 'Uploaded Main Test', title, { targetId: test._id, targetModel: 'Test' });
            notifyInstructorAsync(title);
            return res.status(201).json({ success: true, message: 'Main Test submitted for review', data: test });
        }
        if (type === 'assignment') {
            const assignment = await Assignment.create({
                title, description, subject: subjectId,
                fileUrl: filePath, facultyId: req.user.userId,
                isMain: true, status: 'draft',
                deadline: req.body.deadline ? new Date(req.body.deadline) : defaultDeadline,
                maxMarks: Number(req.body.maxMarks) || 100
            });
            await logAction(req, 'Uploaded Main Assignment', title, { targetId: assignment._id, targetModel: 'Assignment' });
            notifyInstructorAsync(title);
            return res.status(201).json({ success: true, message: 'Main Assignment submitted for review', data: assignment });
        }
    }

    // 4. Handle Chapter-specific resources
    if (chapterId) {
        const chapter = await Chapter.findById(chapterId);
        if (!chapter) return res.status(404).json({ message: 'Chapter not found' });

        const resource = { 
            title, 
            url: filePath, 
            description, 
            uploadedBy: req.user.userId, 
            uploadedAt: new Date(),
            status: 'draft',
            rejectionReason: '',
            assignedTo: []
        };

        if (type === 'note') chapter.notes.push(resource);
        else if (type === 'liveNote') chapter.liveNotes.push(resource);
        else if (type === 'dpp') chapter.dpps.push(resource);
        else if (type === 'pyq') chapter.pyqs.push(resource);
        else if (type === 'test' || type === 'assignment') {
             // Handle chapter specific assessments as full models
             const Model = type === 'test' ? Test : Assignment;
             const entry = await Model.create({
                 title, description, subject: subjectId, chapter: chapterId,
                 fileUrl: filePath, faculty: req.user.userId, facultyId: req.user.userId,
                 isMain: false, status: 'draft',
                 deadline: defaultDeadline
             });
             notifyInstructorAsync(title);
             return res.status(201).json({ success: true, message: `Chapter ${type} submitted for review`, data: entry });
        }

        await chapter.save();
        notifyInstructorAsync(title);
        return res.status(201).json({ success: true, message: 'Content uploaded successfully', data: chapter });
    }

    res.status(400).json({ message: 'Invalid content type or missing target' });
});

// GET /api/faculty/live-classes
exports.getLiveClasses = asyncHandler(async (req, res) => {
    try {
        // Find all classes first
        const classes = await LiveClass.find({ faculty: req.user.userId })
            .populate('batches', 'name')
            .populate('attendance.studentId', 'name email image')
            .sort({ scheduledAt: 1 });

        // Manually populate subjects only for those that have valid ObjectIDs
        // This avoids 500 errors when Mongoose tries to populate a string like "STANDARD MODULE"
        const populatedClasses = await Promise.all(classes.map(async (cls) => {
            const clsObj = cls.toObject();
            if (cls.subject && typeof cls.subject !== 'string' && cls.subject.toString().match(/^[0-9a-fA-F]{24}$/)) {
                try {
                    const Subject = require('../models/Subject');
                    clsObj.subject = await Subject.findById(cls.subject).select('name');
                } catch (e) {
                    console.warn(`[LiveClasses] Skip populate for subject ${cls.subject}`);
                }
            }
            return clsObj;
        }));
        
        res.status(200).json({ success: true, data: populatedClasses });
    } catch (error) {
        console.error('[LiveClasses API Error]:', error.message);
        res.status(500).json({ success: false, message: 'Failed to retrieve live sessions', error: error.message });
    }
});

// POST /api/faculty/live-classes
exports.scheduleLiveClass = asyncHandler(async (req, res) => {
    const { title, batchId, subject, scheduledAt, date, time, duration, type, chapterId, meetingLink } = req.body;
    
    let finalScheduledAt = scheduledAt ? new Date(scheduledAt) : new Date();
    if (date && time) {
        finalScheduledAt = new Date(`${date}T${time}`);
    }

    const liveClass = await LiveClass.create({
        title, batches: batchId ? [batchId] : [], subject, faculty: req.user.userId,
        scheduledAt: finalScheduledAt, duration: parseInt(duration) || 60,
        meetingLink: meetingLink || 'pending', status: 'upcoming', type: type || 'lecture', chapter: chapterId || null
    });
    res.status(201).json({ success: true, data: liveClass });
});

// GET /api/faculty/live-classes/:id/start
exports.startLiveClass = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const liveClass = await LiveClass.findById(id).populate('faculty', 'name');
    if (!liveClass) return res.status(404).json({ message: 'Live class not found' });
    
    if (liveClass.faculty._id.toString() !== req.user.userId.toString()) {
        return res.status(403).json({ message: 'Unauthorized to start this class' });
    }

    const meetingId = liveClass._id.toString();
    const name = liveClass.title;
    const attendeePW = 'viewer123';
    const moderatorPW = 'mod123';
    
    await bbb.createMeeting(meetingId, name, attendeePW, moderatorPW);
    const joinUrl = bbb.getJoinUrl(meetingId, liveClass.faculty.name, moderatorPW, req.user.userId);
    
    liveClass.status = 'ongoing';
    await liveClass.save();
    
    await logAction(req, 'Started Live Class', liveClass.title, { targetId: liveClass._id, targetModel: 'LiveClass' });
    
    res.status(200).json({ success: true, data: { joinUrl } });
});

// POST /api/faculty/live-classes/:id/end
exports.endLiveClass = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const liveClass = await LiveClass.findById(id).populate('faculty', 'name');
    if (!liveClass) return res.status(404).json({ message: 'Live class not found' });
    
    if (liveClass.faculty._id.toString() !== req.user.userId.toString()) {
        return res.status(403).json({ message: 'Unauthorized to end this class' });
    }

    try {
        await bbb.endMeeting(liveClass._id.toString(), 'mod123');
    } catch (err) {
        console.warn('Meeting already ended or non-existent in BBB');
    }

    liveClass.status = 'completed';
    await liveClass.save();

    await logAction(req, 'Ended Live Class', liveClass.title, { targetId: liveClass._id, targetModel: 'LiveClass' });
    
    res.status(200).json({ success: true, message: 'Class ended and moved to results' });
});

// DELETE /api/faculty/live-classes/:id
exports.deleteLiveClass = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const liveClass = await LiveClass.findById(id);
    if (!liveClass) return res.status(404).json({ message: 'Live class not found' });

    if (liveClass.faculty.toString() !== req.user.userId.toString()) {
        return res.status(403).json({ message: 'Unauthorized to delete this class' });
    }

    if (liveClass.status === 'ongoing') {
        return res.status(400).json({ message: 'Cannot delete an ongoing class. Please end it first.' });
    }

    await LiveClass.findByIdAndDelete(id);
    await logAction(req, 'Deleted Live Class', liveClass.title, { targetId: liveClass._id, targetModel: 'LiveClass' });

    res.status(200).json({ success: true, message: 'Live class deleted successfully' });
});

// GET /api/faculty/content
// Aggregates all uploaded resource types for the faculty dashboard overview
exports.getAllContent = asyncHandler(async (req, res) => {
    const facultyId = req.user.userId;
    
    // Get videos, faqs, live recordings
    const videos = await RecordedClass.find({ faculty: facultyId }).populate('subject', 'name').populate('chapter', 'name').lean();
    
    // Get notes, dpps, etc
    const chapters = await Chapter.find({ 
        $or: [
            { 'notes.uploadedBy': facultyId },
            { 'liveNotes.uploadedBy': facultyId },
            { 'dpps.uploadedBy': facultyId },
            { 'pyqs.uploadedBy': facultyId }
        ]
    }).populate('subject', 'name').lean();
    
    let documents = [];
    const fieldToType = { notes: 'note', liveNotes: 'liveNote', dpps: 'dpp', pyqs: 'pyq' };
    chapters.forEach(chapter => {
        ['notes', 'liveNotes', 'dpps', 'pyqs'].forEach(field => {
            const resources = (chapter[field] || []).filter(r => r.uploadedBy && r.uploadedBy.toString() === facultyId.toString());
            resources.forEach(r => documents.push({ 
                ...r, 
                chapterName: chapter.name, 
                chapterId: chapter._id, 
                subject: chapter.subject, 
                type: fieldToType[field] 
            }));
        });
    });

    // Get tests and assignments
    const tests = await Test.find({ faculty: facultyId }).populate('subject', 'name').populate('chapter', 'name').lean();
    const assignments = await Assignment.find({ facultyId: facultyId }).populate('subject', 'name').populate('chapter', 'name').lean();

    const videosMapped = videos.map(v => ({...v, type: 'video'}));
    const testsMapped = tests.map(t => ({...t, type: 'test'}));
    const asgMapped = assignments.map(a => ({...a, type: 'assignment'}));

    const content = [...videosMapped, ...documents, ...testsMapped, ...asgMapped].sort((a, b) => {
        const dA = new Date(a.createdAt || a.uploadedAt || 0).getTime();
        const dB = new Date(b.createdAt || b.uploadedAt || 0).getTime();
        return (isNaN(dB) ? 0 : dB) - (isNaN(dA) ? 0 : dA);
    });
    
    res.status(200).json({ success: true, data: content });
});

// Content Management Methods (Unchanged standard logic)
exports.getUploadedContent = asyncHandler(async (req, res) => {
    const { type } = req.params;
    const facultyId = req.user.userId;
    let content = [];

    if (['video', 'faq', 'liveRecording'].includes(type)) {
        let contentType = 'lecture';
        if (type === 'faq') contentType = 'faq';
        else if (type === 'liveRecording') contentType = 'liveRecording';
        content = await RecordedClass.find({ faculty: facultyId, contentType }).populate('subject', 'name').populate('chapter', 'name').sort({ createdAt: -1 });
    } else if (type === 'test') {
        content = await Test.find({ faculty: facultyId }).populate('subject', 'name').sort({ createdAt: -1 });
    } else if (type === 'assignment') {
        content = await Assignment.find({ facultyId: facultyId }).populate('subject', 'name').sort({ createdAt: -1 });
    } else if (['note', 'liveNote', 'dpp', 'pyq'].includes(type)) {
        const fieldMap = { note: 'notes', liveNote: 'liveNotes', dpp: 'dpps', pyq: 'pyqs' };
        const field = fieldMap[type];
        const chapters = await Chapter.find({ [`${field}.uploadedBy`]: facultyId }).populate('subject', 'name').lean();
        chapters.forEach(chapter => {
            const resources = (chapter[field] || []).filter(r => r.uploadedBy && r.uploadedBy.toString() === facultyId.toString());
            resources.forEach(r => content.push({ ...r, chapterId: chapter._id, subject: chapter.subject, type: type }));
        });
        content.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    }
    res.status(200).json({ success: true, data: content });
});

exports.getContentAnalysis = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const facultyId = req.user.userId;

    // Check RecordedClass
    let content = await RecordedClass.findById(id)
        .populate('assignedTo', 'name')
        .populate('watchProgress.student', 'name email');

    let type = 'video';

    if (!content) {
        // Check Test
        content = await Test.findById(id).populate('assignedTo', 'name');
        type = 'test';
    }

    if (!content) {
        // Check Assignment
        const entry = await Assignment.findById(id).populate('assignedBatches', 'name').lean();
        if (entry) {
            content = { ...entry, assignedTo: entry.assignedBatches || [] };
            type = 'assignment';
        }
    }

    if (!content) {
        // Check Chapter Resources
        const chapter = await Chapter.findOne({
            $or: [
                { 'notes._id': id },
                { 'liveNotes._id': id },
                { 'dpps._id': id },
                { 'pyqs._id': id }
            ]
        }).populate('assignedTo', 'name').populate('notes.assignedTo liveNotes.assignedTo dpps.assignedTo pyqs.assignedTo', 'name');

        if (chapter) {
            for (const field of ['notes', 'liveNotes', 'dpps', 'pyqs']) {
                const r = chapter[field].id(id);
                if (r) {
                    const resourceObj = r.toObject();
                    content = {
                        ...resourceObj,
                        // Show both specific assignments and inherited ones
                        assignedTo: [...(resourceObj.assignedTo || []), ...(chapter.assignedTo || [])]
                    };
                    type = field.replace('s', '');
                    break;
                }
            }
        }
    }

    if (!content) return res.status(404).json({ message: 'Content not found' });

    // Permission check
    const ownerId = content.faculty || content.facultyId || content.uploadedBy;
    if (ownerId && ownerId.toString() !== facultyId.toString()) {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    res.status(200).json({ success: true, data: content, contentType: type });
});

exports.updateUploadedContent = asyncHandler(async (req, res) => {
    const { type, id } = req.params;
    const { title, description } = req.body;
    const facultyId = req.user.userId;

    const videoFile = req.files?.['file']?.[0] || req.file;
    const assignmentFile = req.files?.['assignment']?.[0];
    const thumbnailFile = req.files?.['thumbnail']?.[0];

    const updateData = { title, description, status: 'draft' };
    if (videoFile) updateData.videoUrl = videoFile.mimetype?.startsWith('video/') ? await uploadToS3(videoFile, ['video', 'faq', 'liveRecording'].includes(type) ? 'videos' : 'materials') : formatLocalPath(req, videoFile.path, videoFile);
    if (videoFile && !['video', 'faq', 'liveRecording'].includes(type)) updateData.url = updateData.videoUrl; 
    if (assignmentFile) updateData.assignmentUrl = formatLocalPath(req, assignmentFile.path, assignmentFile);
    if (thumbnailFile) updateData.thumbnail = await uploadToCloudinary(thumbnailFile, 'bl_thumbnails');

    if (['video', 'faq', 'liveRecording'].includes(type)) {
        const item = await RecordedClass.findOneAndUpdate({ _id: id, faculty: facultyId }, updateData, { new: true });
        return res.status(200).json({ success: true, data: item });
    } else if (type === 'test') {
        const item = await Test.findOneAndUpdate({ _id: id, faculty: facultyId }, updateData, { new: true });
        return res.status(200).json({ success: true, data: item });
    } else if (type === 'assignment') {
        const item = await Assignment.findOneAndUpdate({ _id: id, facultyId: facultyId }, updateData, { new: true });
        return res.status(200).json({ success: true, data: item });
    } else if (['note', 'liveNote', 'dpp', 'pyq'].includes(type)) {
        const { chapterId } = req.body;
        const field = { note: 'notes', liveNote: 'liveNotes', dpp: 'dpps', pyq: 'pyqs' }[type];
        const chapter = await Chapter.findById(chapterId);
        if (!chapter) return res.status(404).json({ message: 'Chapter not found' });
        const resource = chapter[field].id(id);
        if (resource) {
            resource.title = title || resource.title;
            resource.description = description || resource.description;
            resource.status = 'draft'; // Reset status to draft for re-review
            if (videoFile) resource.url = videoFile.mimetype?.startsWith('video/') ? await uploadToS3(videoFile, 'materials') : formatLocalPath(req, videoFile.path, videoFile);
            await chapter.save();
        }
        return res.status(200).json({ success: true, data: resource });
    }
    res.status(400).json({ message: 'Invalid type' });
});

exports.deleteUploadedContent = asyncHandler(async (req, res) => {
    const { type, id } = req.params;
    const facultyId = req.user.userId;

    const directDelete = async (Model, query) => {
        const item = await Model.findOne(query);
        if (!item) return false;
        await Model.deleteOne(query);
        return true;
    };

    let success = false;
    if (['video', 'faq', 'liveRecording'].includes(type)) {
        success = await directDelete(RecordedClass, { _id: id, faculty: facultyId });
    } else if (type === 'test') {
        success = await directDelete(Test, { _id: id, faculty: facultyId });
    } else if (type === 'assignment') {
        success = await directDelete(Assignment, { _id: id, facultyId: facultyId });
    } else if (['note', 'liveNote', 'dpp', 'pyq'].includes(type)) {
        const { chapterId } = req.query;
        const fieldMap = { note: 'notes', liveNote: 'liveNotes', dpp: 'dpps', pyq: 'pyqs' };
        const field = fieldMap[type];
        const chapter = await Chapter.findById(chapterId);
        if (chapter) {
            const resource = chapter[field].id(id);
            if (resource) {
                chapter[field].pull(id);
                await chapter.save();
                success = true;
            }
        }
    }

    if (success) {
        res.status(200).json({ success: true, message: 'Deleted successfully' });
    } else {
        res.status(404).json({ message: 'Content not found' });
    }
});

// Profile Management
exports.updateProfile = asyncHandler(async (req, res) => {
    const faculty = await require('../models/Faculty').findById(req.user.userId);
    if (!faculty) return res.status(404).json({ message: 'Faculty not found' });

    faculty.name = req.body.name || faculty.name;
    // We don't update email/password directly here, they go through requests
    
    await faculty.save();
    res.status(200).json({ success: true, message: 'Profile updated successfully', data: { name: faculty.name, email: faculty.email } });
});

exports.createProfileRequest = asyncHandler(async (req, res) => {
    const { type, newValue } = req.body;
    
    // Check if there's already a pending request
    const existing = await ProfileUpdateRequest.findOne({ userId: req.user.userId, status: 'pending', type });
    if (existing) return res.status(400).json({ message: 'You already have a pending request for this update' });

    const request = await ProfileUpdateRequest.create({
        userId: req.user.userId,
        userModel: 'Faculty',
        type, 
        newValue
    });

    await logAction(req, 'Created Profile Update Request', `Type: ${type}`, { targetId: request._id, targetModel: 'ProfileUpdateRequest' });
    res.status(201).json({ success: true, message: 'Profile update request submitted', data: request });
});

// Other methods (getBatches, etc) remain available via exports
exports.getBatches = asyncHandler(async (req, res) => {
    const batches = await Batch.find({}).lean();
    res.status(200).json({ success: true, data: batches });
});

exports.getStudents = asyncHandler(async (req, res) => {
    const facultyId = req.user.userId;

    // 1. Find subjects this faculty teaches
    const subjects = await Subject.find({ faculty: facultyId }).select('_id assignedTo');

    // 2. Collect all batch IDs from those subjects
    const batchIds = [...new Set(subjects.flatMap(s => s.assignedTo.map(b => b.toString())))];

    // 3. Find students in those batches
    let students = [];
    if (batchIds.length > 0) {
        const batches = await Batch.find({ _id: { $in: batchIds } }).select('students name');
        const studentIds = [...new Set(batches.flatMap(b => b.students.map(s => s.toString())))];
        students = await Student.find({ _id: { $in: studentIds } }).select('-password').lean();

        // Attach batch name to each student
        const studentBatchMap = {};
        batches.forEach(b => {
            b.students.forEach(sId => {
                const key = sId.toString();
                if (!studentBatchMap[key]) studentBatchMap[key] = [];
                studentBatchMap[key].push(b.name);
            });
        });
        students = students.map(s => ({ ...s, batches: studentBatchMap[s._id.toString()] || [] }));
    }

    res.status(200).json({ success: true, data: students });
});


exports.getStudentMetrics = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const student = await Student.findById(id).select('-password');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    
    const assignments = await Assignment.find({ 'submissions.studentId': id }).lean();
    const tests = await Test.find({ 'submissions.studentId': id }).lean();
    
    // Fetch playback history
    const recordedClassesRaw = await RecordedClass.find({ "watchProgress.student": id }).select('title contentType watchProgress').lean();
    const recordedClasses = recordedClassesRaw.map(v => {
        const progress = v.watchProgress.find(p => p.student?.toString() === id);
        return { _id: v._id, title: v.title, type: v.contentType, progress };
    });

    const liveClassesRaw = await LiveClass.find({ "attendance.studentId": id }).select('title status scheduledAt duration attendance').lean();
    const liveClasses = liveClassesRaw.map(l => {
         const att = l.attendance.find(a => a.studentId === id);
         return { _id: l._id, title: l.title, scheduledAt: l.scheduledAt, duration: l.duration, status: l.status, attendance: att };
    });
    
    // Keep legacy metrics key active just in case portions expect it during transition
    const metrics = { attendance: 85, watchTimeHours: 20, activityScore: 78 };
    
    res.status(200).json({ success: true, data: { student, assignments, tests, recordedClasses, liveClasses, metrics } });
});

exports.addStudentNote = asyncHandler(async (req, res) => {
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
});

// GET /api/faculty/assessments/forwarded
exports.getForwardedSubmissions = asyncHandler(async (req, res) => {
    const facultyId = req.user.userId;

    // Fetch all assignments and tests for this faculty
    const assignments = await Assignment.find({ facultyId: facultyId }).populate('submissions.studentId', 'name email').lean();
    const tests = await Test.find({ faculty: facultyId }).populate('submissions.studentId', 'name email').lean();

    const result = [];

    const processItem = (item, type) => {
        const relevantSubmissions = (item.submissions || []).filter(s => ['forwarded', 'graded'].includes(s.status));
        
        // Always add the assessment info once so the frontend knows it exists
        const baseInfo = {
            assessmentId: item._id,
            assessmentTitle: item.title,
            assessmentType: type,
            maxMarks: item.maxMarks,
            deadline: item.deadline,
            isEmpty: relevantSubmissions.length === 0
        };

        if (relevantSubmissions.length === 0) {
            result.push(baseInfo);
        } else {
            relevantSubmissions.forEach(s => {
                result.push({
                    ...baseInfo,
                    studentId: s.studentId?._id || s.studentId,
                    studentName: s.studentId?.name || 'Unknown',
                    studentEmail: s.studentId?.email,
                    fileUrl: s.fileUrl,
                    submittedAt: s.submittedAt,
                    forwardedAt: s.forwardedAt,
                    status: s.status,
                    marks: s.marks,
                    feedback: s.feedback
                });
            });
        }
    };

    assignments.forEach(a => processItem(a, 'assignment'));
    tests.forEach(t => processItem(t, 'test'));

    res.status(200).json({ success: true, count: result.length, data: result });
});

// POST /api/faculty/assessments/:id/grade/:studentId
exports.gradeSubmission = asyncHandler(async (req, res) => {
    const { id, studentId } = req.params;
    const { type, marks, feedback } = req.body;
    const facultyId = req.user.userId;

    const Model = type === 'test' ? Test : Assignment;
    const assessment = await Model.findById(id);

    if (!assessment) return res.status(404).json({ message: 'Assessment not found' });

    const submission = assessment.submissions.find(s => s.studentId.toString() === studentId);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    submission.marks = marks;
    submission.feedback = feedback;
    submission.status = 'graded';
    submission.gradedBy = facultyId;
    submission.gradedAt = new Date();
    
    // Explicitly mark modified for array sub-document updates
    assessment.markModified('submissions');
    await assessment.save();

    // Notify Student
    try {
        await Notification.create({
            message: `Your ${type} "${assessment.title}" has been graded. Marks: ${marks}`,
            type: 'info',
            recipient: studentId.toString(),
            sender: facultyId
        });
    } catch (notifyErr) {
        console.error('[NOTIFY_ERROR]', notifyErr);
        // Don't fail the whole grading if notification fails
    }

    await logAction(req, 'Graded Submission', `Assessment: ${assessment.title}, Student: ${studentId}`, { targetId: id, targetModel: type === 'test' ? 'Test' : 'Assignment' });

    res.status(200).json({ success: true, message: 'Submission graded successfully' });
});

// GET /api/faculty/badge-counts
exports.getFacultyBadgeCounts = asyncHandler(async (req, res) => {
    const facultyId = req.user.userId;

    const [pendingAssignments, pendingTests, ongoingSession, rejectedClasses, rejectedChapters, unreadNotifs] = await Promise.all([
        // 1. Pending grading: submitted but not yet graded for this faculty
        Assignment.countDocuments({ facultyId, 'submissions.status': 'submitted' }),
        Test.countDocuments({ faculty: facultyId, 'submissions.status': 'submitted' }),
        
        // 2. Ongoing session check
        LiveClass.countDocuments({ faculty: facultyId, status: 'ongoing' }),
        
        // 3. Rejected content (videos, tests, chapter resources)
        RecordedClass.countDocuments({ faculty: facultyId, status: 'rejected' }),
        Chapter.find({
            $or: [
                { 'notes.uploadedBy': facultyId, 'notes.status': 'rejected' },
                { 'liveNotes.uploadedBy': facultyId, 'liveNotes.status': 'rejected' },
                { 'dpps.uploadedBy': facultyId, 'dpps.status': 'rejected' },
                { 'pyqs.uploadedBy': facultyId, 'pyqs.status': 'rejected' }
            ]
        }).lean(),
        
        // 4. Notifications
        Notification.countDocuments({
            recipient: { $in: [facultyId, 'all'] },
            dismissedBy: { $ne: facultyId }
        })
    ]);

    // Calculate rejected resources from chapters
    let rejectedResCount = 0;
    rejectedChapters.forEach(chap => {
        ['notes', 'liveNotes', 'dpps', 'pyqs'].forEach(field => {
            rejectedResCount += (chap[field] || []).filter(r => 
                r.uploadedBy?.toString() === facultyId.toString() && r.status === 'rejected'
            ).length;
        });
    });

    res.json({
        success: true,
        data: {
            pendingGrading: pendingAssignments + pendingTests,
            ongoingSession: ongoingSession > 0,
            rejectedContent: rejectedClasses + rejectedResCount,
            unreadNotifs: unreadNotifs
        }
    });
});
