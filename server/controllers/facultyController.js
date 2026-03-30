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
const ProfileRequest = require('../models/ProfileRequest');
const logAction = require('../utils/logAction');

// Helper to format local file paths to relative URLs
const formatLocalPath = (req, filePath) => {
    if (!filePath) return null;
    // If it's already an HTTP URL (Cloudinary), keep it
    if (filePath.startsWith('http')) return filePath;
    
    // For local paths, normalize and extract relative public path
    const normalized = filePath.replace(/\\/g, '/');
    const uploadsIndex = normalized.indexOf('/uploads/');
    const relativePath = uploadsIndex !== -1 ? normalized.substring(uploadsIndex) : normalized;
    
    // Prepend server origin
    const origin = `${req.protocol}://${req.get('host')}`;
    return `${origin}${relativePath}`;
};

// GET /api/faculty/dashboard
exports.getDashboardStats = asyncHandler(async (req, res) => {
    const subjects = await Subject.countDocuments({ faculty: req.user.userId });
    const batches = await Batch.countDocuments({});
    const liveClasses = await LiveClass.countDocuments({ faculty: req.user.userId, status: 'scheduled' });
    const students = await Student.countDocuments();
    res.status(200).json({ subjects, batches, liveClasses, students });
});

// GET /api/faculty/subjects
exports.getAssignedSubjects = asyncHandler(async (req, res) => {
    const subjects = await Subject.find({ faculty: req.user.userId }).lean();
    const result = await Promise.all(subjects.map(async (sub) => {
        const chapters = await Chapter.find({ subject: sub._id }).select('name').lean();
        return { ...sub, chapters };
    }));
    res.status(200).json(result);
});

// POST /api/faculty/content/upload
exports.uploadContent = asyncHandler(async (req, res) => {
    const { type, title, description, chapterId, subjectId, isMain } = req.body;
    const isMainAssessment = isMain === 'true' || isMain === true;

    if (!isMainAssessment && !chapterId && (type !== 'faq')) {
        return res.status(400).json({ message: 'Chapter ID is required' });
    }

    // Extraction for multi-field upload (Video + Assignment) or single file
    const videoFile = req.files?.['file']?.[0] || req.file;
    const assignmentFile = req.files?.['assignment']?.[0];
    
    if (!videoFile && !assignmentFile) return res.status(400).json({ message: 'At least one file is required.' });

    const filePath = formatLocalPath(req, videoFile?.path);
    const assignmentPath = formatLocalPath(req, assignmentFile?.path);

    // 1. Handle FAQ Sessions & Recorded Classes
    if (type === 'faq' || type === 'video') {
        const content = await RecordedClass.create({
            title,
            videoUrl: filePath,
            assignmentUrl: assignmentPath,
            description,
            chapter: chapterId || null,
            subject: subjectId,
            faculty: req.user.userId,
            contentType: type === 'faq' ? 'faq' : 'lecture',
            status: 'draft'
        });

        await logAction(req, type === 'faq' ? 'Uploaded FAQ Session' : 'Uploaded Recorded Class', title, { targetId: content._id, targetModel: 'RecordedClass' });
        return res.status(201).json({ message: `${type === 'faq' ? 'FAQ Session' : 'Recorded Class'} submitted for review`, content });
    }

    // 3. Handle Main Test / Main Assignment (Root Level)
    if (isMainAssessment) {
        if (type === 'test') {
            const test = await Test.create({
                title, description, fileUrl: filePath,
                faculty: req.user.userId, subject: subjectId,
                isMain: true, status: 'draft'
            });
            await logAction(req, 'Uploaded Main Test', title, { targetId: test._id, targetModel: 'Test' });
            return res.status(201).json({ message: 'Main Test submitted for review', test });
        }
        if (type === 'assignment') {
            const assignment = await Assignment.create({
                title, description, subject: subjectId,
                fileUrl: filePath, facultyId: req.user.userId,
                isMain: true, status: 'draft'
            });
            await logAction(req, 'Uploaded Main Assignment', title, { targetId: assignment._id, targetModel: 'Assignment' });
            return res.status(201).json({ message: 'Main Assignment submitted for review', assignment });
        }
    }

    // 4. Handle Chapter-specific resources
    if (chapterId) {
        const chapter = await Chapter.findById(chapterId);
        if (!chapter) return res.status(404).json({ message: 'Chapter not found' });

        const resource = { title, url: filePath, description, uploadedBy: req.user.userId, uploadedAt: new Date() };

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
                 isMain: false, status: 'draft'
             });
             return res.status(201).json({ message: `Chapter ${type} submitted for review`, entry });
        }

        await chapter.save();
        return res.status(201).json({ message: 'Content uploaded successfully', chapter });
    }

    res.status(400).json({ message: 'Invalid content type or missing target' });
});

// GET /api/faculty/live-classes
exports.getLiveClasses = asyncHandler(async (req, res) => {
    const classes = await LiveClass.find({ faculty: req.user.userId }).populate('batch', 'name').sort({ scheduledAt: 1 });
    res.status(200).json(classes);
});

// POST /api/faculty/live-classes
exports.scheduleLiveClass = asyncHandler(async (req, res) => {
    const { title, batchId, subject, scheduledAt, duration, type, chapterId, meetingLink } = req.body;
    const liveClass = await LiveClass.create({
        title, batch: batchId, subject, faculty: req.user.userId,
        scheduledAt: new Date(scheduledAt), duration: parseInt(duration) || 60,
        meetingLink, status: 'scheduled', type: type || 'lecture', chapter: chapterId || null
    });
    res.status(201).json(liveClass);
});

// Content Management Methods (Unchanged standard logic)
exports.getUploadedContent = asyncHandler(async (req, res) => {
    const { type } = req.params;
    const facultyId = req.user.userId;
    let content = [];

    if (type === 'video' || type === 'faq') {
        content = await RecordedClass.find({ faculty: facultyId, contentType: type === 'video' ? 'lecture' : 'faq' }).populate('subject', 'name').populate('chapter', 'name').sort({ createdAt: -1 });
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
            resources.forEach(r => content.push({ ...r, chapterName: chapter.name, chapterId: chapter._id, subjectName: chapter.subject?.name }));
        });
        content.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    }
    res.status(200).json(content);
});

exports.updateUploadedContent = asyncHandler(async (req, res) => {
    const { type, id } = req.params;
    const { title, description } = req.body;
    const facultyId = req.user.userId;

    const videoFile = req.files?.['file']?.[0] || req.file;
    const assignmentFile = req.files?.['assignment']?.[0];

    const updateData = { title, description };
    if (videoFile) updateData.videoUrl = formatLocalPath(req, videoFile.path);
    if (videoFile && !['video', 'faq'].includes(type)) updateData.url = formatLocalPath(req, videoFile.path); 
    if (assignmentFile) updateData.assignmentUrl = formatLocalPath(req, assignmentFile.path);

    if (type === 'video' || type === 'faq') {
        const item = await RecordedClass.findOneAndUpdate({ _id: id, faculty: facultyId }, updateData, { new: true });
        return res.status(200).json(item);
    } else if (type === 'test') {
        const item = await Test.findOneAndUpdate({ _id: id, faculty: facultyId }, updateData, { new: true });
        return res.status(200).json(item);
    } else if (type === 'assignment') {
        const item = await Assignment.findOneAndUpdate({ _id: id, facultyId: facultyId }, updateData, { new: true });
        return res.status(200).json(item);
    } else if (['note', 'liveNote', 'dpp', 'pyq'].includes(type)) {
        const { chapterId } = req.body;
        const field = { note: 'notes', liveNote: 'liveNotes', dpp: 'dpps', pyq: 'pyqs' }[type];
        const chapter = await Chapter.findById(chapterId);
        if (!chapter) return res.status(404).json({ message: 'Chapter not found' });
        const resource = chapter[field].id(id);
        if (resource) {
            resource.title = title || resource.title;
            resource.description = description || resource.description;
            if (videoFile) resource.url = formatLocalPath(req, videoFile.path);
            await chapter.save();
        }
        return res.status(200).json(resource);
    }
    res.status(400).json({ message: 'Invalid type' });
});

exports.deleteUploadedContent = asyncHandler(async (req, res) => {
    const { type, id } = req.params;
    const facultyId = req.user.userId;
    if (type === 'video' || type === 'faq') await RecordedClass.findOneAndDelete({ _id: id, faculty: facultyId });
    else if (type === 'test') await Test.findOneAndDelete({ _id: id, faculty: facultyId });
    else if (type === 'assignment') await Assignment.findOneAndDelete({ _id: id, facultyId: facultyId });
    else if (['note', 'liveNote', 'dpp', 'pyq'].includes(type)) {
        const { chapterId } = req.query;
        const field = { note: 'notes', liveNote: 'liveNotes', dpp: 'dpps', pyq: 'pyqs' }[type];
        const chapter = await Chapter.findById(chapterId);
        if (chapter) {
            chapter[field].pull(id);
            await chapter.save();
        }
    }
    res.status(200).json({ message: 'Deleted successfully' });
});

// Other methods (updateProfile, getBatches, etc) remain available via exports
exports.getBatches = asyncHandler(async (req, res) => {
    const batches = await Batch.find({}).lean();
    res.status(200).json(batches);
});

exports.getStudents = asyncHandler(async (req, res) => {
    const students = await Student.find({}).select('-password').limit(100);
    res.status(200).json(students);
});

exports.getStudentMetrics = asyncHandler(async (req, res) => {
    const student = await Student.findById(req.params.id).select('-password');
    res.status(200).json({ student, metrics: { attendance: 85, watchTimeHours: 20, activityScore: 78 } });
});

exports.updateProfile = asyncHandler(async (req, res) => {
    const { name, phone } = req.body;
    const Faculty = require('../models/Faculty');
    const faculty = await Faculty.findByIdAndUpdate(req.user.userId, { name, phone }, { new: true });
    res.status(200).json(faculty);
});

exports.createProfileRequest = asyncHandler(async (req, res) => {
    const { name, email, phone, currentDetails } = req.body;
    const ProfileRequest = require('../models/ProfileRequest');
    const request = await ProfileRequest.create({
        faculty: req.user.userId,
        requestedChanges: { name, email, phone },
        currentDetails,
        status: 'pending'
    });
    res.status(201).json(request);
});
