const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');
const RecordedClass = require('../models/RecordedClass');

// ============================
// SUBJECTS
// ============================
exports.getSubjects = async (req, res) => {
    try {
        const query = req.user.role === 'admin' ? {} : { instructor: req.user.userId };
        const subjects = await Subject.find(query)
            .populate('assignedTo', 'name')
            .populate('faculty', 'name');
        res.status(200).json(subjects);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.createSubject = async (req, res) => {
    try {
        const { name, targetGrade, faculty } = req.body;
        const subject = await Subject.create({ 
            name, 
            targetGrade: targetGrade || 'Class 10',
            faculty: faculty || null,
            instructor: req.user.userId, 
            assignedTo: [] 
        });
        res.status(201).json(subject);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.updateSubject = async (req, res) => {
    try {
        const { name, targetGrade, faculty } = req.body;
        const subject = await Subject.findByIdAndUpdate(
            req.params.id, 
            { name, targetGrade, faculty: faculty || null }, 
            { new: true }
        ).populate('assignedTo', 'name').populate('faculty', 'name');
        res.status(200).json(subject);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.deleteSubject = async (req, res) => {
    try {
        await Subject.findByIdAndDelete(req.params.id);
        // Cascade deleting could be added here
        res.status(200).json({ success: true, id: req.params.id });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.assignSubject = async (req, res) => {
    try {
        const { batchIds } = req.body;
        const subject = await Subject.findByIdAndUpdate(req.params.id, { assignedTo: batchIds }, { new: true }).populate('assignedTo', 'name');
        res.status(200).json(subject);
    } catch (error) { res.status(500).json({ message: error.message }); }
};


// ============================
// CHAPTERS
// ============================
exports.getChaptersBySubject = async (req, res) => {
    try {
        const chapters = await Chapter.find({ subject: req.params.subjectId }).populate('assignedTo', 'name');
        res.status(200).json(chapters);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.createChapter = async (req, res) => {
    try {
        const { name, subjectId } = req.body;
        const chapter = await Chapter.create({ name, subject: subjectId, assignedTo: [] });
        res.status(201).json(chapter);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.updateChapter = async (req, res) => {
    try {
        const chapter = await Chapter.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true }).populate('assignedTo', 'name');
        res.status(200).json(chapter);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.deleteChapter = async (req, res) => {
    try {
        await Chapter.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, id: req.params.id });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.assignChapter = async (req, res) => {
    try {
        const { batchIds } = req.body;
        const chapter = await Chapter.findByIdAndUpdate(req.params.id, { assignedTo: batchIds }, { new: true }).populate('assignedTo', 'name');
        res.status(200).json(chapter);
    } catch (error) { res.status(500).json({ message: error.message }); }
};


// ============================
// VIDEOS (RECORDED CLASSES)
// ============================
exports.getVideosByChapter = async (req, res) => {
    try {
        const videos = await RecordedClass.find({ chapter: req.params.chapterId }).populate('assignedTo', 'name');
        res.status(200).json(videos);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.updateVideo = async (req, res) => {
    try {
        const { title, description } = req.body;
        const video = await RecordedClass.findByIdAndUpdate(req.params.id, { title, description }, { new: true }).populate('assignedTo', 'name');
        res.status(200).json(video);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.deleteVideo = async (req, res) => {
    try {
        await RecordedClass.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, id: req.params.id });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.uploadVideo = async (req, res) => {
    try {
        const { title, description, videoUrl, chapterId, subjectId, scheduledFor } = req.body;
        
        const video = await RecordedClass.create({
            title,
            description,
            videoUrl,
            chapter: chapterId,
            subject: subjectId,
            status: scheduledFor ? 'draft' : 'published',
            scheduledFor: scheduledFor || null,
            faculty: req.user.userId
        });
        
        res.status(201).json(video);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.assignVideo = async (req, res) => {
    try {
        const { batchIds } = req.body;
        const video = await RecordedClass.findByIdAndUpdate(req.params.id, { assignedTo: batchIds }, { new: true }).populate('assignedTo', 'name');
        res.status(200).json(video);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// Unassigned Videos logic (Faculty uploads)
exports.getUnassignedVideos = async (req, res) => {
    try {
        const videos = await RecordedClass.find({ status: 'draft', chapter: { $exists: false } }).populate('faculty', 'name');
        res.status(200).json(videos);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.linkVideoToChapter = async (req, res) => {
    try {
        const { chapterId, subjectId } = req.body;
        const video = await RecordedClass.findByIdAndUpdate(
            req.params.id,
            { status: 'published', chapter: chapterId, subject: subjectId },
            { new: true }
        ).populate('assignedTo', 'name');
        res.status(200).json(video);
    } catch (error) { res.status(500).json({ message: error.message }); }
};
