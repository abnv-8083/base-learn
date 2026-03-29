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
const ProfileRequest = require('../models/ProfileRequest');
const logAction = require('../utils/logAction');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

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

    res.status(200).json({ students, faculty, instructors, classes, subjects, revenue, enrollments: paidStudents });
});

// GET /api/admin/users?role=student|faculty|instructor
exports.getUsers = asyncHandler(async (req, res) => {
    const { role } = req.query;
    const Model = getModelByRole(role);
    if (!Model) return res.status(400).json({ message: 'Invalid role requested' });

    const users = await Model.find({}).select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
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
    
    await logAction(req, `Created ${role}`, `User: ${user.name}`, { targetId: user._id, targetModel: role.charAt(0).toUpperCase() + role.slice(1) });

    if (role === 'faculty' || role === 'instructor') {
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
        } catch (e) { console.error('Email fail:', e.message); }
    }

    res.status(201).json(user);
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
    res.status(200).json(user);
});

// DELETE /api/admin/users/:id
exports.deleteUser = asyncHandler(async (req, res) => {
    const user = await findUserById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const Model = getModelByRole(user.role);
    await logAction(req, 'Deleted User', `User: ${user.name}`, { targetId: user._id, targetModel: user.role });
    await Model.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'User deleted' });
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

    res.status(200).json(user);
});

// ---- CLASS CRUD ----
exports.getClasses = asyncHandler(async (req, res) => {
    const classes = await StudyClass.find({}).sort({ createdAt: -1 });
    res.status(200).json(classes);
});

exports.createClass = asyncHandler(async (req, res) => {
    const { name, targetGrade } = req.body;
    const instructor = await Instructor.findOne({}) || await Admin.findOne({});
    
    const studyClass = await StudyClass.create({
        name,
        targetGrade,
        instructor: instructor?._id || req.user.userId
    });

    await logAction(req, 'Created Class', `Class: ${name}`, { targetId: studyClass._id, targetModel: 'StudyClass' });
    res.status(201).json(studyClass);
});

exports.updateClass = asyncHandler(async (req, res) => {
    const studyClass = await StudyClass.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!studyClass) return res.status(404).json({ message: 'Class not found' });
    await logAction(req, 'Updated Class', `Class: ${studyClass.name}`, { targetId: studyClass._id, targetModel: 'StudyClass' });
    res.status(200).json(studyClass);
});

exports.deleteClass = asyncHandler(async (req, res) => {
    const studyClass = await StudyClass.findById(req.params.id);
    if (studyClass) {
        await logAction(req, 'Deleted Class', `Class: ${studyClass.name}`, { targetId: studyClass._id, targetModel: 'StudyClass' });
        await StudyClass.findByIdAndDelete(req.params.id);
    }
    res.status(200).json({ message: 'Class deleted' });
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
        studyClass,
        batches: result,
        totalStudents: result.reduce((acc, b) => acc + b.studentCount, 0)
    });
});

// GET /api/admin/faculty/:id/details
exports.getFacultyDetails = asyncHandler(async (req, res) => {
    const faculty = await Faculty.findById(req.params.id).select('-password');
    if (!faculty) return res.status(404).json({ message: 'Faculty not found' });

    const [liveClasses, assignedSubjects] = await Promise.all([
        LiveClass.find({ faculty: faculty._id }).sort({ createdAt: -1 }).lean(),
        Subject.find({ instructor: faculty._id }).lean()
    ]);

    const completedClasses = liveClasses.filter(c => c.status === 'completed');
    const subjectsSet = new Set(liveClasses.map(c => c.subject));
    
    let totalStudentsReached = 0;
    liveClasses.forEach(c => {
        if (c.attendance && Array.isArray(c.attendance)) {
            totalStudentsReached += c.attendance.filter(a => a.attended).length;
        }
    });

    res.status(200).json({
        faculty,
        assignedSubjects,
        stats: {
            totalClasses: liveClasses.length,
            completedClasses: completedClasses.length,
            subjectsTaught: Array.from(subjectsSet),
            totalStudentsReached
        },
        recentClasses: liveClasses.slice(0, 10)
    });
});

exports.getActivityLogs = asyncHandler(async (req, res) => {
    const { role } = req.query;
    const filter = role && role !== 'all' ? { actorRole: role } : {};
    const logs = await ActivityLog.find(filter).sort({ createdAt: -1 }).limit(100);
    res.status(200).json(logs);
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
    const pendingRequests = await ProfileRequest.find({ faculty: id, status: 'pending' });

    res.status(200).json({
        faculty,
        stats,
        recentClasses: recentLive,
        uploadedContent,
        pendingRequests
    });
});

// POST /api/admin/faculty/approve-request/:requestId
exports.approveProfileRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    const request = await ProfileRequest.findById(requestId).populate('faculty');
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (action === 'reject') {
        request.status = 'rejected';
        await request.save();
        return res.status(200).json({ message: 'Request rejected' });
    }

    const { faculty, type, newValue } = request;

    if (type === 'email') {
        const oldEmail = faculty.email;
        faculty.email = newValue;
        await faculty.save();

        // Notify new email
        try {
            await sendEmail({
                email: newValue,
                subject: 'Email Updated - Base Learn',
                html: `<h1>Email Updated</h1><p>Your faculty account email has been updated to this address by Admin.</p>`
            });
        } catch (e) { console.error('Email fail:', e.message); }

        request.status = 'approved';
        await request.save();
        await logAction(req, 'Approved Email Change', `Faculty: ${faculty.name} (${oldEmail} -> ${newValue})`);
    }

    if (type === 'password') {
        const tempPassword = crypto.randomBytes(4).toString('hex'); // 8 char random hex
        faculty.password = tempPassword;
        await faculty.save();

        // Send temp password to faculty
        try {
            await sendEmail({
                email: faculty.email,
                subject: 'New Password Generated - Base Learn',
                html: `<h1>Password Reset</h1><p>Your request for a password reset was approved. Your new temporary password is: <strong>${tempPassword}</strong></p><p>Please log in and change it immediately.</p>`
            });
        } catch (e) { console.error('Email fail:', e.message); }

        request.status = 'approved';
        await request.save();
        await logAction(req, 'Approved Password Reset', `Faculty: ${faculty.name}`);
    }

    res.status(200).json({ message: 'Request approved and processed' });
});
