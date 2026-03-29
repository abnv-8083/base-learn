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

// GET /api/faculty/dashboard
exports.getDashboardStats = asyncHandler(async (req, res) => {
    const subjects = await Subject.countDocuments({ instructor: req.user.userId });
    const batches = await Batch.countDocuments({});
    const liveClasses = await LiveClass.countDocuments({ faculty: req.user.userId, status: 'scheduled' });
    const students = await Student.countDocuments();
    res.status(200).json({ subjects, batches, liveClasses, students });
});

// GET /api/faculty/subjects
exports.getAssignedSubjects = asyncHandler(async (req, res) => {
    const subjects = await Subject.find({}).lean();
    // Attach chapter count to each subject using a reverse lookup
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

    if (!isMainAssessment && !chapterId) {
        return res.status(400).json({ message: 'Chapter ID is required for non-main content' });
    }

    if (!req.file) return res.status(400).json({ message: 'No file received.' });

    const isVideoFile = /mp4|mov|avi|mkv|webm/i.test(path.extname(req.file.filename).toLowerCase());
    const filePath = isVideoFile 
        ? `/uploads/videos/${req.file.filename}`
        : `/uploads/documents/${req.file.filename}`;

    // 1. Handle FAQ Sessions (Saved as RecordedClass with contentType: 'faq')
    if (type === 'faq') {
        const faq = await RecordedClass.create({
            title,
            videoUrl: filePath,
            description,
            chapter: chapterId || null,
            subject: subjectId,
            faculty: req.user.userId,
            contentType: 'faq',
            status: 'draft'
        });

        await logAction(req, 'Uploaded FAQ Session', title, { targetId: faq._id, targetModel: 'RecordedClass' });
        return res.status(201).json({ message: 'FAQ Session submitted for review', faq });
    }

    // 2. Handle Recorded Classes (Lecture Videos)
    if (type === 'video') {
        const video = await RecordedClass.create({
            title,
            videoUrl: filePath,
            description,
            chapter: chapterId,
            subject: subjectId,
            faculty: req.user.userId,
            contentType: 'lecture',
            status: 'draft'
        });

        await logAction(req, 'Uploaded Recorded Class', title, { targetId: video._id, targetModel: 'RecordedClass' });
        return res.status(201).json({ message: 'Recorded Class submitted for review', video });
    }

    // 3. Handle Main Test / Main Assignment (Root Level)
    if (isMainAssessment) {
        if (type === 'test') {
            const test = await Test.create({
                title,
                description,
                fileUrl: filePath,
                faculty: req.user.userId,
                subject: subjectId,
                isMain: true,
                status: 'draft'
            });
            await logAction(req, 'Uploaded Main Test', title, { targetId: test._id, targetModel: 'Test' });
            return res.status(201).json({ message: 'Main Test submitted for review', test });
        }
        if (type === 'assignment') {
            const assignment = await Assignment.create({
                title,
                description,
                subject: subjectId,
                fileUrl: filePath,
                facultyId: req.user.userId,
                isMain: true,
                status: 'draft'
            });
            await logAction(req, 'Uploaded Main Assignment', title, { targetId: assignment._id, targetModel: 'Assignment' });
            return res.status(201).json({ message: 'Main Assignment submitted for review', assignment });
        }
    }

    // 4. Handle Chapter-specific resources (Notes, DPP, etc.)
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });

    const resource = { title, url: filePath, description, uploadedBy: req.user.userId, uploadedAt: new Date() };

    if (type === 'note') chapter.notes.push(resource);
    else if (type === 'liveNote') chapter.liveNotes.push(resource);
    else if (type === 'dpp') chapter.dpps.push(resource);
    else if (type === 'pyq') chapter.pyqs.push(resource);
    else if (type === 'test') {
        // If it's a chapter-specific test, we can use the Test model too
        const test = await Test.create({
            title,
            description,
            fileUrl: filePath,
            faculty: req.user.userId,
            subject: subjectId,
            chapter: chapterId,
            isMain: false,
            status: 'draft'
        });
        return res.status(201).json({ message: 'Chapter Test submitted for review', test });
    }
    else if (type === 'assignment') {
        const assignment = await Assignment.create({
            title,
            description,
            subject: subjectId,
            fileUrl: filePath,
            facultyId: req.user.userId,
            isMain: false,
            status: 'draft'
        });
        return res.status(201).json({ message: 'Chapter Assignment submitted for review', assignment });
    }

    await chapter.save();
    const actionMap = { note: 'Uploaded Note', liveNote: 'Uploaded Live Class Note', dpp: 'Uploaded DPP', pyq: 'Uploaded PYQ' };
    await logAction(req, actionMap[type] || 'Uploaded Content', `Chapter: ${chapter.name}`, { targetId: chapter._id, targetModel: 'Chapter', details: { title } });

    res.status(201).json({ message: 'Content uploaded successfully', chapter });
});

// GET /api/faculty/live-classes
exports.getLiveClasses = asyncHandler(async (req, res) => {
    const classes = await LiveClass.find({ faculty: req.user.userId })
        .populate('batch', 'name')
        .sort({ scheduledAt: 1 });
    res.status(200).json(classes);
});

// POST /api/faculty/live-classes
exports.scheduleLiveClass = asyncHandler(async (req, res) => {
    const { title, batchId, subject, scheduledAt, duration, type, chapterId, meetingLink } = req.body;
    const liveClass = await LiveClass.create({
        title,
        batch: batchId,
        subject,
        faculty: req.user.userId,
        scheduledAt: new Date(scheduledAt),
        duration: parseInt(duration) || 60,
        meetingLink: meetingLink || `https://zoom.us/j/${Math.floor(Math.random() * 900000000 + 100000000)}`,
        status: 'scheduled',
        type: type || 'lecture',
        chapter: chapterId || null
    });

    await logAction(req, 'Scheduled Live Class', `Class: ${title}`, { targetId: liveClass._id, targetModel: 'LiveClass' });

    res.status(201).json(liveClass);
});

// GET /api/faculty/batches
exports.getBatches = asyncHandler(async (req, res) => {
    const batches = await Batch.find({}).lean();
    res.status(200).json(batches);
});

// GET /api/faculty/students
exports.getStudents = asyncHandler(async (req, res) => {
    const students = await Student.find({}).select('-password').limit(100);
    res.status(200).json(students);
});

// GET /api/faculty/students/:id/metrics
exports.getStudentMetrics = asyncHandler(async (req, res) => {
    const student = await Student.findById(req.params.id).select('-password');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    
    // Simulated metrics payload — real implementation queries attendance logs later
    res.status(200).json({
        student,
        metrics: {
            attendance: Math.floor(Math.random() * 40 + 60), // 60-100%
            watchTimeHours: Math.floor(Math.random() * 30 + 10),
            activityScore: Math.floor(Math.random() * 50 + 50),
        }
    });
});

// PUT /api/faculty/profile
exports.updateProfile = asyncHandler(async (req, res) => {
    const { name, phone, district, qualification, experience, specialization, about } = req.body;
    const Faculty = require('../models/Faculty');

    // Basic server-side validation
    if (!name || name.length < 3) {
        return res.status(400).json({ message: 'Name must be at least 3 characters long' });
    }

    const faculty = await Faculty.findById(req.user.userId);
    if (!faculty) {
        return res.status(404).json({ message: 'Faculty not found' });
    }

    // Update fields
    faculty.name = name || faculty.name;
    faculty.phone = phone || faculty.phone;
    faculty.district = district || faculty.district;
    faculty.qualification = qualification || faculty.qualification;
    faculty.experience = experience || faculty.experience;
    faculty.specialization = specialization || faculty.specialization;
    faculty.about = about || faculty.about;

    const updatedFaculty = await faculty.save();

    res.status(200).json({
        _id: updatedFaculty._id,
        name: updatedFaculty.name,
        email: updatedFaculty.email,
        phone: updatedFaculty.phone,
        district: updatedFaculty.district,
        qualification: updatedFaculty.qualification,
        experience: updatedFaculty.experience,
        specialization: updatedFaculty.specialization,
        about: updatedFaculty.about,
        profilePhoto: updatedFaculty.profilePhoto,
        role: updatedFaculty.role
    });
});
