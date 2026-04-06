const asyncHandler = require('express-async-handler');
const Admin = require('../models/Admin');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Instructor = require('../models/Instructor');
const StudyClass = require('../models/StudyClass');
const Subject = require('../models/Subject');
const Batch = require('../models/Batch');
const ActivityLog = require('../models/ActivityLog');
const LiveClass = require('../models/LiveClass');
const RecordedClass = require('../models/RecordedClass');
const ProfileUpdateRequest = require('../models/ProfileUpdateRequest');
const Notification = require('../models/Notification');
const Payment = require('../models/Payment');
const logAction = require('../utils/logAction');
const sendEmail = require('../utils/sendEmail');
const SystemSettings = require('../models/SystemSettings');
const AdmissionEnquiry = require('../models/AdmissionEnquiry');
const crypto = require('crypto');
const whatsappService = require('../utils/whatsappService');

// Helper to find a user across all collections
const findUserById = async (id) => {
    let user = await Student.findById(id);
    if (!user) user = await Faculty.findById(id);
    if (!user) user = await Instructor.findById(id);
    if (!user) user = await Admin.findById(id);
    return user;
};

const getModelByRole = (role) => {
    if (role === 'student') return Student;
    if (role === 'faculty') return Faculty;
    if (role === 'instructor') return Instructor;
    if (role === 'admin') return Admin;
    return null;
};

// GET /api/admin/dashboard
exports.getDashboardStats = asyncHandler(async (req, res) => {
    const [students, faculty, instructors, classes, subjects] = await Promise.all([
        Student.countDocuments(),
        Faculty.countDocuments(),
        Instructor.countDocuments(),
        StudyClass.countDocuments(),
        Subject.countDocuments(),
    ]);

    const paidStudents = await Student.countDocuments({ hasPaid: true });
    const revenue = `₹${(paidStudents * 3500).toLocaleString('en-IN')}`;

    res.status(200).json({ success: true, data: { students, faculty, instructors, classes, subjects, revenue, enrollments: paidStudents } });
});

// GET /api/admin/users?role=student|faculty|instructor
exports.getUsers = asyncHandler(async (req, res) => {
    const { role } = req.query;
    const Model = getModelByRole(role);
    if (!Model) return res.status(400).json({ message: 'Invalid role requested' });

    const users = await Model.find({}).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: users });
});

// POST /api/admin/users
exports.createUser = asyncHandler(async (req, res) => {
    const { name, email, password, role, ...rest } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ message: 'Missing required fields' });

    const Model = getModelByRole(role);
    if (!Model) return res.status(400).json({ message: 'Invalid role' });

    const exists = await Model.findOne({ email });
    if (exists) return res.status(400).json({ message: `A ${role} with this email already exists.` });

    const user = await Model.create({ name, email, password, role, isVerified: true, ...rest });

    // --- NEW: Manual Batch Assignment for Admin-created Students ---
    if (role === 'student' && req.body.batchId) {
        try {
            const batch = await Batch.findById(req.body.batchId);
            if (batch) {
                if (!batch.students.includes(user._id)) {
                    batch.students.push(user._id);
                    await batch.save();
                    console.log(`[ADMIN-BATCH] Manually added student to batch: ${batch.name}`);
                }
            }
        } catch (err) {
            console.error('Manual batch assignment fail:', err.message);
        }
    }

    // --- NEW: Manual Subject Assignment for Admin-created Faculty ---
    if (role === 'faculty' && req.body.subject) {
        try {
            const Subject = require('../models/Subject');
            const subject = await Subject.findById(req.body.subject);
            if (subject) {
                subject.faculty = user._id;
                await subject.save();
            }
        } catch (err) {
            console.error('Manual subject assignment fail:', err.message);
        }
    }
    
    await logAction(req, `Created ${role}`, `User: ${user.name}`, { targetId: user._id, targetModel: role.charAt(0).toUpperCase() + role.slice(1) });

    if (role === 'faculty' || role === 'instructor' || role === 'student') {
        try {
            const portalUrl = `${req.protocol}://${req.get('host')}`;
            const detailsHtml = Object.entries(rest).map(([k, v]) => `<p style="margin: 4px 0; color: #475569;"><strong>${k}:</strong> ${v}</p>`).join('');
            const html = `
                <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                    <div style="text-align: center; background: linear-gradient(135deg, #0F2D6B, #6366f1); padding: 30px; border-radius: 10px 10px 0 0; margin: -20px -20px 0 -20px;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">🎓 Base Learn</h1>
                        <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0 0;">Education Platform</p>
                    </div>
                    
                    <div style="padding: 30px 20px;">
                        <h2 style="color: #1e293b; margin-top: 0;">Welcome, ${name}! 👋</h2>
                        <p style="color: #475569; line-height: 1.6;">This email is to notify you that your <strong>${role}</strong> account has been created by the Admin on Base Learn. You can now log in to your portal and start teaching!</p>
                        
                        <!-- LOGIN BUTTON -->
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${portalUrl}/staff-login?role=${role}" style="background: linear-gradient(135deg, #0F2D6B, #6366f1); color: white; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; letter-spacing: 0.5px;">👉 Open ${role.charAt(0).toUpperCase() + role.slice(1)} Portal</a>
                        </div>

                        <!-- CREDENTIALS BOX -->
                        <div style="background: #f0f4ff; border: 2px solid #6366f1; border-radius: 10px; padding: 20px; margin: 20px 0;">
                            <h3 style="color: #4338ca; margin: 0 0 15px 0; font-size: 16px; text-transform: uppercase; letter-spacing: 0.05em;">🔑 Your Login Credentials</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr><td style="padding: 8px 0; color: #64748b; font-weight: bold; width: 40%;">Portal URL:</td><td style="padding: 8px 0; color: #1e293b;"><a href="${portalUrl}/staff-login?role=${role}" style="color: #6366f1;">${portalUrl}/staff-login</a></td></tr>
                                <tr><td style="padding: 8px 0; color: #64748b; font-weight: bold;">Email:</td><td style="padding: 8px 0; color: #1e293b; font-weight: bold;">${email}</td></tr>
                                <tr><td style="padding: 8px 0; color: #64748b; font-weight: bold;">Password:</td><td style="padding: 8px 0; color: #1e293b; font-weight: bold; font-size: 18px; letter-spacing: 2px;">${password}</td></tr>
                                <tr><td style="padding: 8px 0; color: #64748b; font-weight: bold;">Role:</td><td style="padding: 8px 0;"><span style="background: #6366f1; color: white; padding: 2px 10px; border-radius: 20px; font-size: 13px;">${role}</span></td></tr>
                            </table>
                        </div>

                        <!-- PROFILE DETAILS BOX -->
                        <div style="margin: 20px 0; padding: 16px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px;">
                            <h3 style="color: #1e293b; margin: 0 0 12px 0; font-size: 15px;">📋 Your Profile Details (Added by Admin)</h3>
                            <p style="margin: 4px 0; color: #475569;"><strong>Name:</strong> ${name}</p>
                            <p style="margin: 4px 0; color: #475569;"><strong>Email:</strong> ${email}</p>
                            <p style="margin: 4px 0; color: #475569;"><strong>Role:</strong> ${role}</p>
                            ${detailsHtml}
                        </div>

                        <!-- ADMIN DETAILS BOX -->
                        <div style="margin: 20px 0; padding: 16px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px;">
                            <h3 style="color: #1e293b; margin: 0 0 12px 0; font-size: 15px;">👤 Added By</h3>
                            <p style="margin: 4px 0; color: #475569;"><strong>Admin Name:</strong> ${req.user.name}</p>
                            <p style="margin: 4px 0; color: #475569;"><strong>Admin Email:</strong> ${req.user.email}</p>
                        </div>

                        <p style="color: #ef4444; font-size: 13px; border-left: 3px solid #ef4444; padding-left: 10px;">⚠️ For your security, please change your password immediately after your first login.</p>

                        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">© ${new Date().getFullYear()} Base Learn Education Platform. This is an automated message.</p>
                    </div>
                </div>`;
            await sendEmail({ email: user.email, subject: `Welcome to Base Learn - Your ${role.charAt(0).toUpperCase() + role.slice(1)} Portal Access`, html });
        } catch (e) { console.error('Email preparation fail:', e.message); }
    }

    res.status(201).json({ success: true, data: user });
});

// PUT /api/admin/users/:id
exports.updateUser = asyncHandler(async (req, res) => {
    const { role } = req.body;
    let Model = getModelByRole(role);
    let user;

    if (Model) {
        user = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    } else {
        // Fallback: search all if role not provided
        const models = [Student, Faculty, Instructor, Admin];
        for (const M of models) {
            user = await M.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
            if (user) break;
        }
    }

    if (!user) return res.status(404).json({ message: 'User not found' });
    await logAction(req, 'Updated User', `User: ${user.name}`, { targetId: user._id, targetModel: user.role });
    res.status(200).json({ success: true, data: user });
});

// DELETE /api/admin/users/:id
exports.deleteUser = asyncHandler(async (req, res) => {
    const user = await findUserById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const Model = getModelByRole(user.role);
    await logAction(req, 'Deleted User', `User: ${user.name}`, { targetId: user._id, targetModel: user.role });
    await Model.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ success: true, message: 'User deleted' });
});

// PATCH /api/admin/users/:id/status
exports.toggleUserStatus = asyncHandler(async (req, res) => {
    const user = await findUserById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const Model = getModelByRole(user.role);
    user.isActive = req.body.isActive;
    await user.save();

    const action = user.isActive ? 'Activated User' : 'Blocked User';
    await logAction(req, action, `User: ${user.name}`, { targetId: user._id, targetModel: user.role });

    res.status(200).json({ success: true, data: user });
});

// ---- CLASS CRUD ----
exports.getClasses = asyncHandler(async (req, res) => {
    const classes = await StudyClass.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: classes });
});

exports.createClass = asyncHandler(async (req, res) => {
    const { name, targetGrade, instructorId } = req.body;
    
    // Find a valid instructor fallback if not provided
    let instructor = instructorId;
    if (!instructor) {
        const foundInstructor = await Instructor.findOne({});
        instructor = foundInstructor?._id || req.user.userId;
    }
    
    const studyClass = await StudyClass.create({
        name,
        targetGrade: targetGrade || null,
        instructor: instructor
    });

    await logAction(req, 'Created Class', `Class: ${name}`, { targetId: studyClass._id, targetModel: 'StudyClass' });
    res.status(201).json({ success: true, data: studyClass });
});

exports.updateClass = asyncHandler(async (req, res) => {
    const studyClass = await StudyClass.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!studyClass) return res.status(404).json({ message: 'Class not found' });
    await logAction(req, 'Updated Class', `Class: ${studyClass.name}`, { targetId: studyClass._id, targetModel: 'StudyClass' });
    res.status(200).json({ success: true, data: studyClass });
});

exports.deleteClass = asyncHandler(async (req, res) => {
    const studyClass = await StudyClass.findById(req.params.id);
    if (studyClass) {
        await logAction(req, 'Deleted Class', `Class: ${studyClass.name}`, { targetId: studyClass._id, targetModel: 'StudyClass' });
        await StudyClass.findByIdAndDelete(req.params.id);
    }
    res.status(200).json({ success: true, message: 'Class deleted' });
});

exports.getClassDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const studyClass = await StudyClass.findById(id).lean();
    if (!studyClass) return res.status(404).json({ message: 'Class not found' });

    const batches = await Batch.find({ studyClass: id })
        .populate('instructor', 'name email')
        .lean();

    const result = batches.map(batch => ({
        ...batch,
        studentCount: batch.students?.length || 0
    }));

    res.status(200).json({
        success: true,
        data: {
            studyClass,
            batches: result,
            totalStudents: result.reduce((acc, b) => acc + b.studentCount, 0)
        }
    });
});

// GET /api/admin/batches-by-class
exports.getBatchesByClass = asyncHandler(async (req, res) => {
    const { className } = req.query;
    if (!className) return res.status(400).json({ message: 'Class name is required' });

    const studyClass = await StudyClass.findOne({ 
        $or: [{ name: className }, { targetGrade: className }] 
    });
    
    if (!studyClass) return res.status(200).json([]);

    const batches = await Batch.find({ studyClass: studyClass._id })
        .populate('instructor', 'name email');
    
    res.status(200).json({ success: true, data: batches });
});

// ---- BATCH CRUD (admin curriculum) ----
exports.getBatches = asyncHandler(async (req, res) => {
    const batches = await Batch.find({})
        .populate('instructor', 'name email')
        .populate('studyClass', 'name targetGrade')
        .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: batches });
});

exports.createBatch = asyncHandler(async (req, res) => {
    const { name, studyClass, instructor, capacity, location, mode, description } = req.body;
    if (!name || !studyClass || !instructor) {
        return res.status(400).json({ message: 'Name, associated class, and instructor are required' });
    }
    const batch = await Batch.create({
        name,
        description: description || '',
        studyClass,
        instructor,
        capacity: capacity !== undefined && capacity !== '' ? Number(capacity) : 30,
        location: location || '',
        mode: ['online', 'offline', 'hybrid'].includes(mode) ? mode : 'online'
    });
    const populated = await Batch.findById(batch._id)
        .populate('instructor', 'name email')
        .populate('studyClass', 'name targetGrade');
    await logAction(req, 'Created Batch', `Batch: ${name}`, { targetId: batch._id, targetModel: 'Batch' });
    res.status(201).json({ success: true, data: populated });
});

exports.updateBatch = asyncHandler(async (req, res) => {
    const update = { ...req.body };
    if (update.capacity !== undefined) update.capacity = Number(update.capacity);
    const batch = await Batch.findByIdAndUpdate(req.params.id, update, { new: true })
        .populate('instructor', 'name email')
        .populate('studyClass', 'name targetGrade');
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    await logAction(req, 'Updated Batch', `Batch: ${batch.name}`, { targetId: batch._id, targetModel: 'Batch' });
    res.status(200).json({ success: true, data: batch });
});

exports.deleteBatch = asyncHandler(async (req, res) => {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    await logAction(req, 'Deleted Batch', `Batch: ${batch.name}`, { targetId: batch._id, targetModel: 'Batch' });
    await Batch.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Batch deleted' });
});

// GET /api/admin/students/:id/details
exports.getStudentDetails = asyncHandler(async (req, res) => {
    const studentId = req.params.id;
    const student = await Student.findById(studentId).select('-password');
    
    if (!student) {
        return res.status(404).json({ message: 'Student not found' });
    }

    const batches = await Batch.find({ students: studentId }).populate('studyClass');

    res.status(200).json({ success: true, data: { student, batches } });
});

// GET /api/admin/instructors/:id/details
exports.getInstructorDetails = asyncHandler(async (req, res) => {
    const instructor = await Instructor.findById(req.params.id).select('-password');
    if (!instructor) return res.status(404).json({ message: 'Instructor not found' });

    const [studyClasses, batches] = await Promise.all([
        StudyClass.find({ instructor: instructor._id }).lean(),
        Batch.find({ instructor: instructor._id }).lean()
    ]);

    let totalStudentsManaged = 0;
    batches.forEach(b => {
        if (b.students) totalStudentsManaged += b.students.length;
    });

    res.status(200).json({
        success: true,
        data: {
            instructor,
            studyClasses,
            batches,
            stats: {
                totalClasses: studyClasses.length,
                totalBatches: batches.length,
                totalStudentsManaged
            }
        }
    });
});

// POST /api/admin/upload-image
exports.uploadImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    const imageUrl = `/uploads/profiles/${req.file.filename}`;
    res.status(200).json({ success: true, data: { url: imageUrl } });
});

exports.getActivityLogs = asyncHandler(async (req, res) => {
    const { role } = req.query;
    const filter = role && role !== 'all' ? { actorRole: role } : {};
    const logs = await ActivityLog.find(filter).sort({ createdAt: -1 }).limit(100);
    res.status(200).json({ success: true, data: logs });
});

exports.clearActivityLogs = asyncHandler(async (req, res) => {
    await ActivityLog.deleteMany({});
    await logAction(req, 'Cleared Activity Logs', 'All system activity logs have been permanently deleted.');
    res.status(200).json({ success: true, message: 'All logs cleared successfully' });
});

// GET /api/admin/faculty/:id/details
exports.getFacultyDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const faculty = await Faculty.findById(id).select('-password');
    if (!faculty) return res.status(404).json({ message: 'Faculty not found' });

    // 1. Stats from Live Classes
    const liveClasses = await LiveClass.find({ faculty: id });
    const stats = {
        totalClasses: liveClasses.length,
        completedClasses: liveClasses.filter(c => c.status === 'completed').length,
        totalStudentsReached: liveClasses.reduce((acc, c) => acc + (c.attendance?.filter(a => a.attended).length || 0), 0),
        subjectsTaught: [...new Set(liveClasses.map(c => c.subject))]
    };

    // 2. Recent Live Classes
    const recentLive = await LiveClass.find({ faculty: id })
        .sort({ scheduledAt: -1 })
        .limit(5);

    // 3. Uploaded Content (Recorded Classes)
    const uploadedContent = await RecordedClass.find({ faculty: id })
        .sort({ createdAt: -1 })
        .limit(10);

    // 4. Pending Profile Requests
    const pendingRequests = await ProfileUpdateRequest.find({ faculty: id, status: 'pending' });

    res.status(200).json({
        success: true,
        data: {
            faculty,
            stats,
            recentClasses: recentLive,
            uploadedContent,
            pendingRequests
        }
    });
});

// POST /api/admin/faculty/approve-request/:requestId
exports.approveProfileRequest = asyncHandler(async (req, res) => {
    const { id, requestId } = req.params;
    const finalId = id || requestId;
    console.log('--- Approving Request ---', { finalId, body: req.body, path: req.path });
    
    // Determine action from URL path if not in body
    const action = req.body.action || (req.path.includes('reject') ? 'reject' : 'approve'); 

    const request = await ProfileUpdateRequest.findById(finalId).populate('userId');
    console.log('Request found:', !!request);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    console.log('User found:', !!request.userId);
    if (!request.userId) return res.status(404).json({ message: 'User not found in request context' });
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (action === 'reject') {
        request.status = 'rejected';
        await request.save();

        // Notify user about rejection
        await Notification.create({
            message: `Your ${request.type} update request has been rejected. ${req.body.adminComment ? `Reason: ${req.body.adminComment}` : ''}`,
            type: 'alert',
            recipient: request.userId._id ? request.userId._id.toString() : request.userId.toString(),
            sender: req.user.userId
        });

        return res.status(200).json({ success: true, message: 'Request rejected' });
    }

    const { userId: user, type, newValue } = request;

    if (type === 'email') {
        const oldEmail = user.email;
        user.email = newValue;
        await user.save();

        // Notify new email
        try {
            await sendEmail({
                email: newValue,
                subject: 'Email Updated - Base Learn',
                html: `<h1>Email Updated</h1><p>Your user account email has been updated to this address by Admin.</p>`
            });
        } catch (e) { console.error('Email fail:', e.message); }

        request.status = 'approved';
        await request.save();
        await logAction(req, 'Approved Email Change', `Faculty: ${user.name} (${oldEmail} -> ${newValue})`);
        
        // Notify user about approval
        await Notification.create({
            message: `Your email update request to ${newValue} has been approved.`,
            type: 'info',
            recipient: user._id.toString(),
            sender: req.user.userId
        });
    }

    if (type === 'password') {
        const tempPassword = crypto.randomBytes(4).toString('hex'); // 8 char random hex
        user.password = tempPassword;
        await user.save();

        // Send temp password to user
        try {
            await sendEmail({
                email: user.email,
                subject: 'New Password Generated - Base Learn',
                html: `<h1>Password Reset</h1><p>Your request for a password reset was approved. Your new temporary password is: <strong>${tempPassword}</strong></p><p>Please log in and change it immediately.</p>`
            });
        } catch (e) { console.error('Email fail:', e.message); }

        request.status = 'approved';
        await request.save();
        await logAction(req, 'Approved Password Reset', `Faculty: ${user.name}`);

        // Notify user about approval
        await Notification.create({
            message: `Your ${type} update request has been approved.`,
            type: 'info',
            recipient: user._id.toString(),
            sender: req.user.userId
        });
    }

    res.status(200).json({ success: true, message: 'Request approved and processed' });
});

// ---- SUBJECT CRUD ----
// GET /api/admin/subjects
exports.getSubjects = asyncHandler(async (req, res) => {
    const subjects = await Subject.find({})
        .populate('instructor', 'name email role')
        .populate('faculty', 'name email role')
        .populate('assignedTo', 'name')
        .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: subjects });
});

// POST /api/admin/subjects
exports.createSubject = asyncHandler(async (req, res) => {
    const { name, description, targetGrade, instructorId, faculties } = req.body;
    if (!name) return res.status(400).json({ message: 'Subject name is required' });

    // Find a valid instructor — use provided or fallback to first available
    let instructor = instructorId;
    if (!instructor) {
        const defaultInstructor = await Instructor.findOne({});
        if (!defaultInstructor) return res.status(400).json({ message: 'No instructor available. Create an instructor first.' });
        instructor = defaultInstructor._id;
    }

    const subject = await Subject.create({
        name,
        description: description || '',
        targetGrade: targetGrade || 'Class 10',
        instructor,
        faculty: faculties || [],
        assignedTo: []
    });

    const populated = await Subject.findById(subject._id)
        .populate('instructor', 'name email role')
        .populate('faculty', 'name email role');

    await logAction(req, 'Created Subject', `Subject: ${name}`, { targetId: subject._id, targetModel: 'Subject' });
    res.status(201).json({ success: true, data: populated });
});

// PUT /api/admin/subjects/:id
exports.updateSubject = asyncHandler(async (req, res) => {
    const { name, description, targetGrade, instructorId, faculties } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (targetGrade) updateData.targetGrade = targetGrade;
    if (instructorId) updateData.instructor = instructorId;
    if (faculties !== undefined) updateData.faculty = faculties || [];

    const subject = await Subject.findByIdAndUpdate(req.params.id, updateData, { new: true })
        .populate('instructor', 'name email role')
        .populate('faculty', 'name email role')
        .populate('assignedTo', 'name');

    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    await logAction(req, 'Updated Subject', `Subject: ${subject.name}`, { targetId: subject._id, targetModel: 'Subject' });
    res.status(200).json({ success: true, data: subject });
});

// DELETE /api/admin/subjects/:id
exports.deleteSubject = asyncHandler(async (req, res) => {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    await logAction(req, 'Deleted Subject', `Subject: ${subject.name}`, { targetId: subject._id, targetModel: 'Subject' });
    await Subject.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Subject deleted', data: { id: req.params.id } });
});

// GET /api/admin/profile-requests
exports.getProfileRequests = asyncHandler(async (req, res) => {
    const requests = await ProfileUpdateRequest.find({ status: 'pending' }).populate('userId', 'name email');
    res.status(200).json({ success: true, data: requests });
});

// PUT /api/admin/profile-requests/:id/reject
exports.rejectProfileRequest = asyncHandler(async (req, res) => {
    const request = await ProfileUpdateRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    
    request.status = 'rejected';
    await request.save();

    // Notify user about rejection
    await Notification.create({
        message: `Your ${request.type} update request has been rejected.`,
        type: 'alert',
        recipient: request.userId.toString(),
        sender: req.user.userId
    });

    res.status(200).json({ success: true, message: 'Request rejected' });
});

// GET /api/admin/enquiries
exports.getAdmissionEnquiries = asyncHandler(async (req, res) => {
    const list = await AdmissionEnquiry.find({}).sort({ createdAt: -1 }).limit(500);
    res.status(200).json({ success: true, data: list });
});

// PATCH /api/admin/enquiries/:id
exports.updateAdmissionEnquiry = asyncHandler(async (req, res) => {
    const { status, notes } = req.body;
    const enq = await AdmissionEnquiry.findById(req.params.id);
    if (!enq) return res.status(404).json({ message: 'Enquiry not found' });
    if (status && ['new', 'contacted', 'enrolled', 'dropped'].includes(status)) enq.status = status;
    if (notes !== undefined) enq.notes = notes;
    await enq.save();
    await logAction(req, 'Updated admission enquiry', `Enquiry: ${enq.email}`, {
        targetId: enq._id,
        targetModel: 'AdmissionEnquiry',
    });
    res.status(200).json({ success: true, data: enq });
});

// DELETE /api/admin/enquiries/:id
exports.deleteAdmissionEnquiry = asyncHandler(async (req, res) => {
    const enq = await AdmissionEnquiry.findById(req.params.id);
    if (!enq) return res.status(404).json({ message: 'Enquiry not found' });
    
    await logAction(req, 'Deleted admission enquiry', `Enquiry: ${enq.email}`, {
        targetId: enq._id,
        targetModel: 'AdmissionEnquiry',
    });
    
    await AdmissionEnquiry.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Enquiry deleted successfully' });
});

// GET /api/admin/settings
exports.getSettings = asyncHandler(async (req, res) => {
    const settings = await SystemSettings.getSettings();
    res.status(200).json({ success: true, data: settings });
});

// PUT /api/admin/settings
exports.updateSettings = asyncHandler(async (req, res) => {
    let settings = await SystemSettings.findOne();
    if (!settings) {
        settings = new SystemSettings(req.body);
    } else {
        const b = req.body;
        if (b.platformName !== undefined) settings.platformName = b.platformName;
        if (b.supportEmail !== undefined) settings.supportEmail = b.supportEmail;
        if (b.maintenanceMode !== undefined) settings.maintenanceMode = !!b.maintenanceMode;
        if (b.maxUploadSizeMB !== undefined) settings.maxUploadSizeMB = Number(b.maxUploadSizeMB) || settings.maxUploadSizeMB;
        if (b.allowRegistration !== undefined) settings.allowRegistration = !!b.allowRegistration;
        if (b.admissionContactEmail !== undefined) settings.admissionContactEmail = b.admissionContactEmail;
        if (b.admissionContactWhatsApp !== undefined) settings.admissionContactWhatsApp = b.admissionContactWhatsApp;
        if (b.notificationPreference !== undefined) settings.notificationPreference = b.notificationPreference;
    }
    await settings.save();
    res.status(200).json({ success: true, data: settings });
});

// GET /api/admin/whatsapp/status
exports.getWhatsAppStatus = asyncHandler(async (req, res) => {
    const status = whatsappService.getWhatsAppStatus();
    res.status(200).json({ success: true, data: status });
});

// POST /api/admin/whatsapp/logout
exports.logoutWhatsApp = asyncHandler(async (req, res) => {
    await whatsappService.logoutWhatsApp();
    res.status(200).json({ success: true, message: 'WhatsApp logged out and re-initializing' });
});

// ═══════════════════════════════════════════════════════
// GET /api/admin/analytics
// Full platform analytics: users, attendance, content, engagement
// ═══════════════════════════════════════════════════════
exports.getAnalytics = asyncHandler(async (req, res) => {
    const Assignment = require('../models/Assignment');
    const Test       = require('../models/Test');
    const Chapter    = require('../models/Chapter');

    // ── 1. User overview ─────────────────────────────────
    const [totalStudents, totalFaculty, totalInstructors,
           activeStudents, paidStudents,
           newStudentsThisMonth, newStudentsLastMonth] = await Promise.all([
        Student.countDocuments(),
        Faculty.countDocuments(),
        Instructor.countDocuments(),
        Student.countDocuments({ isActive: true }),
        Student.countDocuments({ hasPaid: true }),
        Student.countDocuments({ createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }),
        Student.countDocuments({ createdAt: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
            $lt:  new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }})
    ]);

    // ── 2. Content overview ───────────────────────────────
    const [totalLiveClasses, completedLiveClasses, totalRecorded,
           publishedRecorded, totalBatches, totalSubjects, totalChapters] = await Promise.all([
        LiveClass.countDocuments(),
        LiveClass.countDocuments({ status: 'completed' }),
        RecordedClass.countDocuments(),
        RecordedClass.countDocuments({ status: 'published' }),
        Batch.countDocuments(),
        Subject.countDocuments(),
        Chapter.countDocuments()
    ]);

    // ── 3. Live-class attendance aggregation ─────────────
    const liveClassesWithAttendance = await LiveClass.find({ status: 'completed' })
        .populate('faculty', 'name')
        .populate('batches', 'name')
        .lean();

    let totalAttendanceRecords = 0;
    let totalAttended          = 0;
    let totalCameraSeconds     = 0;
    let totalMicSeconds        = 0;
    let totalDurationSeconds   = 0;

    const sessionAnalytics = liveClassesWithAttendance.map(cls => {
        const records  = cls.attendance || [];
        const attended = records.filter(a => a.attended);
        totalAttendanceRecords += records.length;
        totalAttended          += attended.length;
        totalCameraSeconds     += attended.reduce((s, a) => s + (a.cameraOnDurationSeconds || 0), 0);
        totalMicSeconds        += attended.reduce((s, a) => s + (a.micOnDurationSeconds    || 0), 0);
        totalDurationSeconds   += attended.reduce((s, a) => s + (a.totalDurationSeconds    || 0), 0);
        return {
            _id:           cls._id,
            title:         cls.title,
            subject:       cls.subject,
            scheduledAt:   cls.scheduledAt,
            faculty:       cls.faculty?.name || '—',
            batches:       cls.batches?.map(b => b.name).join(', ') || '—',
            enrolled:      records.length,
            attended:      attended.length,
            attendanceRate: records.length > 0 ? Math.round((attended.length / records.length) * 100) : 0,
            avgCamera:     attended.length > 0 ? Math.round(attended.reduce((s, a) => s + (a.cameraEngagementPercent || 0), 0) / attended.length) : 0,
            avgMic:        attended.length > 0 ? Math.round(attended.reduce((s, a) => s + (a.micEngagementPercent    || 0), 0) / attended.length) : 0,
        };
    }).sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt));

    const overallAttendanceRate = totalAttendanceRecords > 0 ? Math.round((totalAttended / totalAttendanceRecords) * 100) : 0;
    const avgCameraEngagement   = totalAttended > 0 ? Math.round((totalCameraSeconds / totalDurationSeconds) * 100) : 0;
    const avgMicEngagement      = totalAttended > 0 ? Math.round((totalMicSeconds    / totalDurationSeconds) * 100) : 0;

    // ── 4. Per-student attendance summary ────────────────
    const allStudents = await Student.find({}).select('name email profilePhoto studentClass hasPaid isActive createdAt').lean();
    const allBatches  = await Batch.find({}).populate('studyClass', 'name').lean();

    const studentBatchMap = {};
    allBatches.forEach(b => {
        (b.students || []).forEach(sid => {
            studentBatchMap[sid.toString()] = { batchName: b.name, className: b.studyClass?.name || '—' };
        });
    });

    const completedClsIds = liveClassesWithAttendance.map(c => c._id.toString());

    const studentSummaries = allStudents.map(s => {
        const sid = s._id.toString();
        let attended = 0, totalSessions = 0,
            camSecs = 0, micSecs = 0, durSecs = 0;

        liveClassesWithAttendance.forEach(cls => {
            const record = (cls.attendance || []).find(a => a.studentId?.toString() === sid);
            if (record) {
                totalSessions++;
                if (record.attended) {
                    attended++;
                    camSecs += record.cameraOnDurationSeconds || 0;
                    micSecs += record.micOnDurationSeconds    || 0;
                    durSecs += record.totalDurationSeconds    || 0;
                }
            }
        });

        return {
            _id:           s._id,
            name:          s.name,
            email:         s.email,
            profilePhoto:  s.profilePhoto,
            studentClass:  s.studentClass || '—',
            hasPaid:       s.hasPaid,
            isActive:      s.isActive,
            joinedAt:      s.createdAt,
            batch:         studentBatchMap[sid]?.batchName || '—',
            class:         studentBatchMap[sid]?.className || '—',
            totalSessions,
            attended,
            attendanceRate:  totalSessions > 0 ? Math.round((attended / totalSessions) * 100) : 0,
            totalDurationFormatted: durSecs > 0 ? `${Math.floor(durSecs / 3600)}h ${Math.floor((durSecs % 3600) / 60)}m` : '—',
            avgCameraPercent: durSecs > 0 ? Math.min(100, Math.round((camSecs / durSecs) * 100)) : 0,
            avgMicPercent:    durSecs > 0 ? Math.min(100, Math.round((micSecs / durSecs) * 100)) : 0,
        };
    });

    // ── 5. Monthly enrolment trend (last 6 months) ────────
    const enrollmentTrend = await Promise.all(
        Array.from({ length: 6 }, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - (5 - i));
            const start = new Date(d.getFullYear(), d.getMonth(), 1);
            const end   = new Date(d.getFullYear(), d.getMonth() + 1, 1);
            return Student.countDocuments({ createdAt: { $gte: start, $lt: end } }).then(count => ({
                month: start.toLocaleDateString('en', { month: 'short', year: '2-digit' }),
                students: count
            }));
        })
    );

    // ── 6. Assessment completion stats ────────────────────
    const [totalAssignments, totalTests] = await Promise.all([
        Assignment.countDocuments({ status: 'published' }),
        Test.countDocuments({ status: 'published' })
    ]);
    const assignmentsWithSubs = await Assignment.find({ status: 'published', 'submissions.0': { $exists: true } }).select('submissions').lean();
    const testsWithSubs       = await Test.find({ status: 'published', 'submissions.0': { $exists: true } }).select('submissions').lean();
    const totalSubmissions = assignmentsWithSubs.reduce((s, a) => s + a.submissions.length, 0)
                           + testsWithSubs.reduce((s, t) => s + t.submissions.length, 0);

    res.status(200).json({
        success: true,
        data: {
            overview: {
                totalStudents, totalFaculty, totalInstructors,
                activeStudents, paidStudents,
                newStudentsThisMonth, newStudentsLastMonth,
                growthPct: newStudentsLastMonth > 0
                    ? Math.round(((newStudentsThisMonth - newStudentsLastMonth) / newStudentsLastMonth) * 100)
                    : null
            },
            content: {
                totalLiveClasses, completedLiveClasses, totalRecorded,
                publishedRecorded, totalBatches, totalSubjects, totalChapters,
                totalAssignments, totalTests, totalSubmissions
            },
            attendance: {
                overallAttendanceRate,
                avgCameraEngagement,
                avgMicEngagement,
                totalSessionsTracked: completedLiveClasses
            },
            enrollmentTrend,
            sessions:   sessionAnalytics,
            students:   studentSummaries
        }
    });
});

// ═══════════════════════════════════════════════════════════════
// PAYMENT MANAGEMENT
// ═══════════════════════════════════════════════════════════════

exports.getPayments = async (req, res) => {
    try {
        const { studentId, status, category, method } = req.query;
        const filter = {};
        if (studentId) filter.student = studentId;
        if (status)    filter.status   = status;
        if (category)  filter.category = category;
        if (method)    filter.method   = method;
        const payments = await Payment.find(filter)
            .populate('student', 'name email phone studentClass profilePhoto')
            .populate('recordedBy', 'name').sort({ paidAt: -1 });
        const total        = payments.reduce((s, p) => s + (p.amount || 0), 0);
        const paidTotal    = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
        const pendingTotal = payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
        res.status(200).json({ success: true, data: payments, summary: { total, paidTotal, pendingTotal, count: payments.length } });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.createPayment = async (req, res) => {
    try {
        const { student, amount, method, status, category, remarks, transactionId, paidAt, dueDate } = req.body;
        if (!student || !amount) return res.status(400).json({ message: 'Student and amount are required' });
        const payment = await Payment.create({
            student, amount: Number(amount), method: method || 'cash',
            status: status || 'paid', category: category || 'tuition',
            remarks, transactionId, paidAt: paidAt || new Date(), dueDate,
            recordedBy: req.user._id
        });
        if (status === 'paid') await Student.findByIdAndUpdate(student, { hasPaid: true });
        await logAction(req, 'Recorded Payment', 'Amount: Rs ' + amount, { targetId: payment._id, targetModel: 'Payment' });
        const populated = await Payment.findById(payment._id)
            .populate('student', 'name email phone studentClass profilePhoto')
            .populate('recordedBy', 'name');
        res.status(201).json({ success: true, data: populated });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.updatePayment = async (req, res) => {
    try {
        const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate('student', 'name email phone studentClass profilePhoto')
            .populate('recordedBy', 'name');
        if (!payment) return res.status(404).json({ message: 'Payment not found' });
        if (req.body.status === 'paid') {
            await Student.findByIdAndUpdate(payment.student._id, { hasPaid: true });
        } else if (['refunded','pending'].includes(req.body.status)) {
            const other = await Payment.countDocuments({ student: payment.student._id, status: 'paid', _id: { $ne: payment._id } });
            if (other === 0) await Student.findByIdAndUpdate(payment.student._id, { hasPaid: false });
        }
        await logAction(req, 'Updated Payment', 'Receipt: ' + payment.receiptNo);
        res.status(200).json({ success: true, data: payment });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.deletePayment = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (!payment) return res.status(404).json({ message: 'Payment not found' });
        await logAction(req, 'Deleted Payment', 'Receipt: ' + payment.receiptNo);
        await Payment.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Payment deleted' });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getStudentPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ student: req.params.studentId })
            .populate('recordedBy', 'name').sort({ paidAt: -1 });
        const student = await Student.findById(req.params.studentId)
            .select('name email phone studentClass profilePhoto hasPaid').lean();
        if (!student) return res.status(404).json({ message: 'Student not found' });
        const totalPaid    = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
        const totalDue     = payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
        const totalPartial = payments.filter(p => p.status === 'partial').reduce((s, p) => s + p.amount, 0);
        res.status(200).json({ success: true, data: { student, payments, summary: { totalPaid, totalDue, totalPartial } } });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

// ═══════════════════════════════════════════════════════════════
// BADGE COUNTS
// ═══════════════════════════════════════════════════════════════

exports.getAdminBadgeCounts = async (req, res) => {
    try {
        const [pendingRequests, newEnquiries, unpaidStudents] = await Promise.all([
            ProfileUpdateRequest.countDocuments({ status: 'pending' }),
            AdmissionEnquiry.countDocuments({ status: 'new' }),
            Student.countDocuments({ hasPaid: false, isActive: true })
        ]);
        res.status(200).json({ success: true, data: { pendingRequests, newEnquiries, unpaidStudents } });
    } catch (e) { res.status(500).json({ message: e.message }); }
};
