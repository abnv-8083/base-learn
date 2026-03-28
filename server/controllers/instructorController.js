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
const logAction = require('../utils/logAction');

// Get Instructor Dashboard Stats
exports.getDashboardStats = async (req, res) => {
    try {
        const totalClasses = await StudyClass.countDocuments({ instructor: req.user.userId });
        const totalBatches = await Batch.countDocuments({ instructor: req.user.userId });
        const scheduledVideos = await RecordedClass.countDocuments({ status: 'draft', scheduledFor: { $gt: new Date() } }); 
        const totalStudents = await Student.countDocuments(); 
        res.status(200).json({ totalClasses, totalBatches, scheduledVideos, totalStudents });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching instructor dashboard stats', error: error.message });
    }
};

// Get Pending Recorded Classes (Lectures & FAQ Sessions)
exports.getPendingRecordedClasses = async (req, res) => {
    try {
        const recordings = await RecordedClass.find({ status: 'draft' })
            .populate('faculty', 'name email')
            .populate('subject', 'name')
            .populate('chapter', 'name');
        res.status(200).json(recordings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pending recordings', error: error.message });
    }
};

// Assign Recorded Class (Lecture or FAQ)
exports.assignRecordedClass = async (req, res) => {
    try {
        const { id } = req.params;
        const { assignedTo, publishDate } = req.body;
        
        const recording = await RecordedClass.findByIdAndUpdate(
            id,
            {
                status: 'published',
                assignedTo,
                publishedAt: publishDate || Date.now()
            },
            { new: true }
        );

        if (recording) {
            await logAction(req, 'Approved Video', `RecordedClass: ${recording.title}`, { targetId: recording._id, targetModel: 'RecordedClass' });
        }

        res.status(200).json(recording);
    } catch (error) {
        res.status(500).json({ message: 'Error assigning recorded class', error: error.message });
    }
};

// Get Pending Assessments (Tests & Assignments)
exports.getPendingAssessments = async (req, res) => {
    try {
        const tests = await Test.find({ status: 'draft' }).populate('faculty', 'name email').populate('subject', 'name').lean();
        const assignments = await Assignment.find({ status: 'draft' }).populate('facultyId', 'name email').lean();
        res.status(200).json({ tests, assignments });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pending assessments', error: error.message });
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
        }

        res.status(200).json(assessment);
    } catch (error) {
        res.status(500).json({ message: 'Error approving assessment', error: error.message });
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
        
        res.status(200).json({ available: availableFaculties, assigned: assignedFaculties });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching faculties', error: error.message });
    }
};

// Get Students (in instructor's batches, or all if full access)
exports.getStudents = async (req, res) => {
    try {
        const students = await Student.find({}).select('-password');
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching students', error: error.message });
    }
};

// Get Student Analysis
exports.getStudentAnalysis = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Student.findById(id).select('-password');
        if (!student) return res.status(404).json({ message: 'Student not found' });
        
        // Fetch assignment submissions this student has made
        const assignments = await Assignment.find({ 'submissions.student': id });
        
        res.status(200).json({ student, assignments });
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

        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({ message: 'Error adding student note', error: error.message });
    }
};

// Get Batches
exports.getBatches = async (req, res) => {
    try {
        const batches = await Batch.find({ instructor: req.user.userId })
            .populate('students', 'name email')
            .populate('instructor', 'name')
            .populate('studyClass', 'name targetGrade');
        res.status(200).json(batches);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching batches', error: error.message });
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
        res.status(201).json(populatedBatch);
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
        res.status(200).json(batch);
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
        res.status(201).json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Error sending notification', error: error.message });
    }
};

// --- Class Management Additions --- //

exports.getStudyClasses = async (req, res) => {
    try {
        const classes = await StudyClass.find({}).sort({ targetGrade: 1 });
        res.status(200).json(classes);
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
        res.status(201).json(studyClass);
    } catch (error) {
        res.status(500).json({ message: 'Error creating class', error: error.message });
    }
};

exports.moveStudentBatch = async (req, res) => {
    try {
        const { studentId, fromBatchId, toBatchId } = req.body;
        
        await Batch.findByIdAndUpdate(fromBatchId, { $pull: { students: studentId } });
        const newBatch = await Batch.findByIdAndUpdate(toBatchId, { $addToSet: { students: studentId } }, { new: true }).populate('students', 'name email').populate('studyClass', 'name targetGrade');
        
        res.status(200).json({ message: "Student moved successfully", newBatch });
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
        res.json(updated);
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
        res.json({ message: 'Study Class deleted successfully' });
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
        res.json(populatedBatch);
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
        res.json({ message: 'Batch deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting batch', error: error.message });
    }
};

// --- Student Management Mutators --- //

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

        res.json(updatedStudent);
    } catch (error) {
        res.status(500).json({ message: 'Error updating student', error: error.message });
    }
};

exports.toggleStudentStatus = async (req, res) => {
    try {
        student.isActive = !student.isActive;
        const updatedStudent = await student.save();
        
        const action = updatedStudent.isActive ? 'Activated Student' : 'Blocked Student';
        await logAction(req, 'Toggled Student Status', `Student: ${updatedStudent.name}`, { targetId: updatedStudent._id, targetModel: 'Student', details: { isActive: updatedStudent.isActive } });

        res.json({ message: updatedStudent.isActive ? 'Student unblocked' : 'Student blocked', isActive: updatedStudent.isActive });
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
        res.json({ message: 'Student deleted successfully and removed from batches' });
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
        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching assignments', error: error.message });
    }
};

exports.distributeAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const { targetType, targetId } = req.body; // targetType: 'batch', 'class', 'student'
        
        const assignment = await Assignment.findById(id);
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
        
        let updateField = '';
        if (targetType === 'batch') updateField = 'assignedBatches';
        else if (targetType === 'class') updateField = 'assignedClasses';
        else if (targetType === 'student') updateField = 'assignedStudents';
        else return res.status(400).json({ message: 'Invalid target type' });
        
        const updatedAssignment = await Assignment.findByIdAndUpdate(
            id,
            { $addToSet: { [updateField]: targetId } },
            { new: true }
        )
        .populate('assignedBatches', 'name')
        .populate('assignedClasses', 'name targetGrade')
        .populate('assignedStudents', 'name email');

        await logAction(req, 'Distributed Assignment', `Assignment: ${assignment.title}`, { targetId: assignment._id, targetModel: 'Assignment', details: { targetType, targetId } });
            
        res.status(200).json(updatedAssignment);
    } catch (error) {
        res.status(500).json({ message: 'Error distributing assignment', error: error.message });
    }
};
