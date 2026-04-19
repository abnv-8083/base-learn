const Admin = require('../models/Admin');
const Instructor = require('../models/Instructor');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
const Session = require('../models/Session');
const Notification = require('../models/Notification');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const SystemSettings = require('../models/SystemSettings');
const AdmissionEnquiry = require('../models/AdmissionEnquiry');
const PasswordReset = require('../models/PasswordReset');
const ProfileUpdateRequest = require('../models/ProfileUpdateRequest');
const { getWhatsAppStatus, sendWhatsAppMessage } = require('../utils/whatsappService');


const findUserByEmail = async (email) => {
    const trimmed = (email || '').trim();
    if (!trimmed) return null;
    return (
        (await Student.findOne({ email: trimmed })) ||
        (await Faculty.findOne({ email: trimmed })) ||
        (await Instructor.findOne({ email: trimmed })) ||
        (await Admin.findOne({ email: trimmed }))
    );
};

const generateAccessToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_ACCESS_SECRET || 'access_fallback', {
        expiresIn: '15m',
    });
};

const generateRefreshToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_REFRESH_SECRET || 'refresh_fallback', {
        expiresIn: '7d',
    });
};

const sendTokenResponse = async (user, statusCode, res, req) => {
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);

    // 1. Save session to database for stateful tracking
    try {
        await Session.create({
            userId: user._id,
            userModel: user.role.charAt(0).toUpperCase() + user.role.slice(1),
            role: user.role,
            refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            userAgent: req ? req.headers['user-agent'] : null,
            ip: req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : null
        });
    } catch (err) {
        console.error('[AUTH] Failed to save session to DB:', err.message);
    }

    const cookieOptions = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        path: '/',
        domain: process.env.COOKIE_DOMAIN || '.baselearn.in'
    };

    // 2. Set role-specific cookie name to allow independent sessions per portal
    const cookieName = `${user.role}_refreshToken`;

    res.status(statusCode)
        .cookie(cookieName, refreshToken, cookieOptions)
        .json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            imageUrl: user.profilePhoto,
            token: accessToken,
        });
};

// @desc    Register a new student
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
    try {
        const { name, email, password, studentClass, school, parentName, parentPhone, phone, countryCode, dob, district } = req.body;

        let userExists = await Student.findOne({ email });
        
        if (userExists) {
            if (userExists.isVerified) {
                return res.status(400).json({ message: 'User already exists and is fully verified' });
            }
            await Student.deleteOne({ email });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const user = await Student.create({
            name,
            email,
            password,
            studentClass: studentClass || null,
            school: school || null,
            parentName: parentName || null,
            parentPhone: parentPhone || null,
            phone: phone || null,
            countryCode: countryCode || '+91',
            dob: dob || null,
            district: district || null,
            role: 'student',
            otp,
            otpExpires,
            isVerified: false
        });

        if (user) {
            const message = `Your Base Learn verification code is: ${otp}.`;
            const html = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #0F2D6B; text-align: center;">Welcome to Base Learn!</h2>
                    <p>Hi ${name},</p>
                    <p>Thank you for starting your registration. Please use the following One-Time Password (OTP) to instantly verify your account. It expires in 10 minutes.</p>
                    <div style="background-color: #f4f7fb; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
                        <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1E40AF;">${otp}</span>
                    </div>
                </div>
            `;

            try {
                await sendEmail({
                    email: user.email,
                    subject: 'Base Learn - Verify Your Account',
                    message,
                    html
                });
                
                res.status(201).json({
                    message: 'Registration stage completed! Please check your email for the OTP.',
                    email: user.email
                });
            } catch (err) {
                console.error('Email sending failed:', err);
                await Student.deleteOne({ _id: user._id });
                return res.status(500).json({ message: 'Email could not be sent. Please enter a valid email.', error: err.message });
            }
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error during registration' });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await Student.findOne({ email });
        
        if (!user) return res.status(404).json({ message: 'User not found. Please register again.' });
        if (user.isVerified) return res.status(400).json({ message: 'Account is already verified. Proceed to Login.' });
        if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP code' });
        if (user.otpExpires < Date.now()) return res.status(400).json({ message: 'OTP has expired. Please register again.' });
        
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
        
        // --- Auto-Assign Student ---
        try {
            if (user.studentClass) {
                const StudyClass = require('../models/StudyClass');
                const Batch = require('../models/Batch');
                // --- NEW: Robust Digit-Aware Student Auto-Assignment ---
                const studentDigit = user.studentClass.match(/\d+/) ? user.studentClass.match(/\d+/)[0] : null;
                const query = {
                    $or: [
                        { targetGrade: user.studentClass },
                        { name: { $regex: user.studentClass, $options: 'i' } },
                        { name: user.studentClass }
                    ]
                };
                if (studentDigit) {
                    query.$or.push({ name: { $regex: `(^|\\s)${studentDigit}($|\\s|-)`, $options: 'i' } });
                    query.$or.push({ targetGrade: { $regex: `(^|\\s)${studentDigit}($|\\s|-)`, $options: 'i' } });
                }

                const matchingClasses = await StudyClass.find(query);
                console.log(`[AUTH-BATCH] Found ${matchingClasses.length} matching classes for "${user.studentClass}" (Digit: ${studentDigit})`);
                
                for (const studyClass of matchingClasses) {
                    const batches = await Batch.find({ studyClass: studyClass._id });
                    let availableBatch = batches.find(b => (b.students ? b.students.length : 0) < (b.capacity || 30));
                    
                    if (availableBatch) {
                        availableBatch.students.push(user._id);
                        await availableBatch.save();
                    } else {
                        const newBatch = new Batch({
                            name: `${studyClass.name} - Batch ${batches.length + 1}`,
                            studyClass: studyClass._id,
                            instructor: studyClass.instructor || req?.user?.userId || (await Admin.findOne({}))?._id,
                            students: [user._id],
                            capacity: 30
                        });
                        await newBatch.save();
                    }
                }
            }
        } catch (autoAssignErr) { console.error('Auto-assign failed:', autoAssignErr); }
        
        await sendTokenResponse(user, 200, res, req);
    } catch (error) {
        res.status(500).json({ message: 'Server Error during OTP verification' });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const roleModelMap = {
            admin: Admin,
            instructor: Instructor,
            faculty: Faculty,
            student: Student
        };

        const Model = roleModelMap[role];
        if (!Model) {
            return res.status(400).json({ message: 'Invalid role provided' });
        }

        // 1. Check primary role first
        const user = await Model.findOne({ $or: [{ email: email }, { phone: email }] });
        
        if (user) {
            if (!(await user.matchPassword(password))) {
                return res.status(401).json({ message: 'Invalid password' });
            }
            if (!user.isActive) {
                return res.status(403).json({ message: 'Account deactivated. Contact Admin.' });
            }
            return await sendTokenResponse(user, 200, res, req);
        }

        // 2. If not found in primary role, check ALL other roles to give intelligent feedback
        const allModels = [
            { model: Admin, name: 'admin' },
            { model: Instructor, name: 'instructor' },
            { model: Faculty, name: 'faculty' },
            { model: Student, name: 'student' }
        ];

        for (const item of allModels) {
            if (item.name === role) continue; // Already checked
            const altUser = await item.model.findOne({ $or: [{ email: email }, { phone: email }] });
            
            if (altUser) {
                if (await altUser.matchPassword(password)) {
                    return res.status(401).json({ 
                        message: `Incorrect portal. Your account is registered as ${item.name.charAt(0).toUpperCase() + item.name.slice(1)}.`,
                        actualRole: item.name
                    });
                } else {
                    // Password mismatch even in alternative role? 
                    // Just say invalid password for now to avoid leaking info or being confusing
                    return res.status(401).json({ message: 'Invalid password' });
                }
            }
        }

        // 3. Fallback: really doesn't exist anywhere
        return res.status(401).json({ message: 'Account not found' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMe = async (req, res) => {
    try {
        // req.user is already populated by protect middleware
        let user = req.user.toObject ? req.user.toObject() : req.user;
        
        if (user.role === 'student') {
            try {
                const Batch = require('../models/Batch');
                const batch = await Batch.findOne({ students: user._id }).populate('studyClass').lean();
                if (batch) {
                    user.batchName = batch.name;
                    user.studyClassName = batch.studyClass ? batch.studyClass.name : 'Unknown Class';
                }
            } catch (err) { console.error(err); }
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const user = req.user; // Populated by protect middleware
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Standard fields for all roles
        if (req.body.name) user.name = req.body.name;
        if (req.body.phone) user.phone = req.body.phone;
        if (req.body.district) user.district = req.body.district;
        
        // Role-specific fields
        if (user.role === 'student') {
            if (req.body.school) user.school = req.body.school;
            if (req.body.studentClass) user.studentClass = req.body.studentClass;
            if (req.body.parentName) user.parentName = req.body.parentName;
            if (req.body.parentPhone) user.parentPhone = req.body.parentPhone;
            if (req.body.dob) user.dob = req.body.dob;
        } else if (user.role === 'faculty') {
            if (req.body.department) user.department = req.body.department;
            if (req.body.qualification) user.qualification = req.body.qualification;
            if (req.body.experience) user.experience = req.body.experience;
            if (req.body.specialization) user.specialization = req.body.specialization;
            if (req.body.about) user.about = req.body.about;
        } else if (user.role === 'instructor') {
            if (req.body.about) user.about = req.body.about;
            if (req.body.specialization) user.specialization = req.body.specialization;
            if (req.body.qualification) user.qualification = req.body.qualification;
            if (req.body.experience) user.experience = req.body.experience;
        }

        await user.save();
        res.status(200).json({ success: true, message: 'Profile updated successfully', data: user });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update profile', error: error.message });
    }
};

const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = req.user;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Both current and new password are required' });
        }

        if (!(await user.matchPassword(currentPassword))) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({ message: 'New password must be different from the current password' });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update password', error: error.message });
    }
};

const submitProfileRequest = async (req, res) => {
    try {
        const { type, newValue } = req.body;
        if (!['email', 'password'].includes(type)) {
            return res.status(400).json({ message: 'Invalid request type' });
        }

        const existing = await ProfileUpdateRequest.findOne({ userId: req.user.userId, status: 'pending', type });
        if (existing) {
            return res.status(400).json({ message: 'A pending request for this update already exists' });
        }

        // Limit requests to 3 per week
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentCount = await ProfileUpdateRequest.countDocuments({
            userId: req.user.userId,
            createdAt: { $gte: oneWeekAgo }
        });

        if (recentCount >= 3) {
            return res.status(400).json({ message: 'Maximum limit of 3 requests per week reached' });
        }

        const request = await ProfileUpdateRequest.create({
            userId: req.user.userId,
            userModel: req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1),
            type,
            newValue
        });

        // Notify admins
        await Notification.create({
            message: `New profile update requested by ${req.user.name} (${req.user.role})`,
            type: 'alert',
            recipient: 'all_admins',
            sender: req.user.userId
        });

        res.status(201).json({ success: true, message: 'Request submitted for review', data: request });
    } catch (error) {
        res.status(500).json({ message: 'Failed to submit request', error: error.message });
    }
};

const getPendingProfileRequest = async (req, res) => {
    try {
        const pending = await ProfileUpdateRequest.findOne({ userId: req.user.userId, status: 'pending' });
        res.status(200).json({ success: true, data: pending });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch pending requests', error: error.message });
    }
};

const getNotifications = async (req, res) => {
    try {
        const userId = req.user.userId || req.user._id;
        const notifications = await Notification.find({
            $and: [
                {
                    $or: [
                        { recipient: userId.toString() },
                        { recipient: 'all' },
                        ...(req.user.role === 'admin' ? [{ recipient: 'all_admins' }] : [])
                    ]
                },
                // dismissedBy is an array — use $nin (not $ne) to check membership
                { dismissedBy: { $nin: [userId] } }
            ]
        }).sort({ createdAt: -1 }).limit(50);
        res.status(200).json(notifications);
    } catch (error) {
        console.error('[getNotifications] Error:', error.message);
        res.status(500).json({ message: 'Error fetching notifications' });
    }
};


const dismissNotification = async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.findByIdAndUpdate(id, {
            $addToSet: { dismissedBy: req.user.userId }
        });
        res.status(200).json({ message: 'Notification dismissed' });
    } catch (error) {
        res.status(500).json({ message: 'Error dismissing notification' });
    }
};

const dismissAllNotifications = async (req, res) => {
    try {
        const userId = req.user.userId || req.user._id;
        await Notification.updateMany(
            {
                $and: [
                    {
                        $or: [
                            { recipient: userId.toString() },
                            { recipient: 'all' },
                            ...(req.user.role === 'admin' ? [{ recipient: 'all_admins' }] : [])
                        ]
                    },
                    { dismissedBy: { $nin: [userId] } }
                ]
            },
            {
                $addToSet: { dismissedBy: userId }
            }
        );
        res.status(200).json({ message: 'All notifications dismissed' });
    } catch (error) {
        res.status(500).json({ message: 'Error dismissing all notifications' });
    }
};

const refreshToken = async (req, res) => {
    try {
        const { role } = req.body;
        const cookieName = role ? `${role}_refreshToken` : 'refreshToken';
        const token = req.cookies[cookieName] || req.cookies['refreshToken'];
        
        if (!token) return res.status(401).json({ message: 'No refresh token found' });

        // Verify session exists in database
        const session = await Session.findOne({ refreshToken: token });
        if (!session) {
            return res.status(401).json({ message: 'Session expired or revoked' });
        }

        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'refresh_fallback');
        
        // Use the role from the session rather than searching all collections
        const roleModelMap = {
            admin: Admin,
            instructor: Instructor,
            faculty: Faculty,
            student: Student
        };

        const Model = roleModelMap[session.role] || Student;
        const user = await Model.findById(decoded.id);

        if (!user) return res.status(401).json({ message: 'User no longer exists' });

        const accessToken = generateAccessToken(user._id, user.role);
        res.status(200).json({ token: accessToken });
    } catch (error) {
        console.error('[AUTH] Refresh error:', error.message);
        res.status(401).json({ message: 'Invalid refresh token' });
    }
};

const logoutUser = async (req, res) => {
    try {
        const { role } = req.body;
        const cookieName = role ? `${role}_refreshToken` : 'refreshToken';
        const token = req.cookies[cookieName];

        if (token) {
            // Remove from database
            await Session.deleteOne({ refreshToken: token });
        }

        res.cookie(cookieName, 'none', {
            expires: new Date(Date.now() + 5 * 1000),
            httpOnly: true,
            path: '/'
        });

        res.status(200).json({ message: `${role || 'User'} logged out successfully` });
    } catch (error) {
        console.error('[AUTH] Logout error:', error.message);
        res.status(500).json({ message: 'Error during logout' });
    }
};

// @desc    Submit an admission enquiry
// @route   POST /api/auth/admission-enquiry
const submitAdmissionEnquiry = async (req, res) => {
    try {
        const { name, studentClass, school, dob, phone, email, parentName, parentPhone } = req.body;
        
        if (!name || !phone || !email) {
            return res.status(400).json({ message: 'Name, Phone and Email are required' });
        }

        const settings = await SystemSettings.getSettings();
        console.log('[Enquiry] Retrieved Settings:', {
            preference: settings.notificationPreference,
            whatsapp: settings.admissionContactWhatsApp,
            email: settings.admissionContactEmail
        });

        const enquiryDetails = `
New Admission Enquiry:
----------------------
Name: ${name}
Class: ${studentClass}
School: ${school}
DOB: ${dob}
Phone: ${phone}
Email: ${email}
Parent: ${parentName}
Parent Phone: ${parentPhone}
        `.trim();

        const pref = settings.notificationPreference || 'whatsapp';
        const sendWa = pref === 'whatsapp' || pref === 'both';
        const sendMail = pref === 'email' || pref === 'both';

        if (sendWa) {
            try {
                console.log('[Enquiry] Attempting WhatsApp Notification via Linked Account');
                const status = getWhatsAppStatus();

                if (status.wid) {
                    await sendWhatsAppMessage(status.wid, enquiryDetails);
                    console.log('[Enquiry] WhatsApp Notification SENT to linked account:', status.wid);
                } else {
                    console.warn('[Enquiry] No WhatsApp account linked. Notification could not be sent.');
                }
            } catch (waErr) {
                console.error('[Enquiry] WhatsApp Notification FAILED:', waErr.message);
            }
        }
        if (sendMail) {
            try {
                await sendEmail({
                    email: settings.admissionContactEmail,
                    subject: `New Admission Enquiry: ${name}`,
                    message: enquiryDetails,
                    html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                            <h2 style="color: #0F2D6B;">New Admission Enquiry</h2>
                            <pre style="background: #f8fafc; padding: 15px; border-radius: 5px;">${enquiryDetails}</pre>
                           </div>`
                });
                console.log('[Enquiry] Email Notification SENT successfully to:', settings.admissionContactEmail);
            } catch (emailErr) {
                console.error('[Enquiry] Email Notification Failed:', emailErr.message);
            }
        }

        try {
            await AdmissionEnquiry.create({
                name,
                studentClass: studentClass || '',
                school: school || '',
                dob: dob || '',
                phone,
                email,
                parentName: parentName || '',
                parentPhone: parentPhone || '',
                district: req.body.district || '',
                message: req.body.message || '',
                status: 'new',
            });
        } catch (dbErr) {
            console.error('[Enquiry] DB save failed:', dbErr.message);
        }

        res.status(200).json({ message: 'Enquiry submitted successfully! Our team will contact you soon.' });
    } catch (error) {
        console.error('[Enquiry] Error:', error);
        res.status(500).json({ message: 'Server Error while submitting enquiry' });
    }
};

// @desc    Request password reset code by email
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(200).json({
                message: 'If an account exists for this email, a reset code has been sent.',
            });
        }
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        await PasswordReset.deleteMany({ email: user.email, used: false });
        await PasswordReset.create({
            email: user.email,
            role: user.role,
            code,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        });
        try {
            await sendEmail({
                email: user.email,
                subject: 'Base Learn — Password reset code',
                message: `Your password reset code is: ${code}. It expires in 15 minutes.`,
                html: `<p>Hi ${user.name || ''},</p><p>Your password reset code is:</p><p style="font-size:24px;font-weight:bold;letter-spacing:4px;">${code}</p><p>This code expires in 15 minutes.</p>`,
            });
        } catch (e) {
            console.error('[forgotPassword] email failed:', e.message);
            return res.status(500).json({ message: 'Could not send email. Try again later.' });
        }
        res.status(200).json({
            message: 'If an account exists for this email, a reset code has been sent.',
        });
    } catch (error) {
        console.error('[forgotPassword]', error);
        res.status(500).json({ message: 'Could not process request' });
    }
};

// @desc    Reset password with email + code
// @route   POST /api/auth/reset-password
const resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;
        if (!email || !code || !newPassword) {
            return res.status(400).json({ message: 'Email, code, and new password are required' });
        }
        if (String(newPassword).length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }
        const trimmedEmail = email.trim();
        const pr = await PasswordReset.findOne({ email: trimmedEmail, used: false }).sort({
            createdAt: -1,
        });
        if (!pr || pr.code !== String(code).trim()) {
            return res.status(400).json({ message: 'Invalid or expired code' });
        }
        if (pr.expiresAt < new Date()) {
            return res.status(400).json({ message: 'Code has expired. Request a new one.' });
        }
        const Model = {
            student: Student,
            faculty: Faculty,
            instructor: Instructor,
            admin: Admin,
        }[pr.role];
        if (!Model) return res.status(400).json({ message: 'Invalid reset session' });
        const user = await Model.findOne({ email: pr.email });
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.password = newPassword;
        await user.save();
        pr.used = true;
        await pr.save();
        res.status(200).json({ message: 'Password updated. You can sign in now.' });
    } catch (error) {
        console.error('[resetPassword]', error);
        res.status(500).json({ message: 'Could not reset password' });
    }
};

// @desc    Get WhatsApp Status (Admin/Staff only)
const getStatusWhatsApp = async (req, res) => {
    try {
        const status = getWhatsAppStatus();
        res.status(200).json(status);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching WhatsApp status' });
    }
};

// @desc    Reset WhatsApp Session
const resetWhatsApp = async (req, res) => {
    try {
        const { logoutWhatsApp } = require('../utils/whatsappService');
        await logoutWhatsApp();
        res.status(200).json({ message: 'WhatsApp session reset initiated' });
    } catch (error) {
        res.status(500).json({ message: 'Error resetting WhatsApp session' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    verifyOTP,
    getNotifications,
    dismissNotification,
    dismissAllNotifications,
    refreshToken,
    logoutUser,
    submitAdmissionEnquiry,
    forgotPassword,
    resetPassword,
    getStatusWhatsApp,
    resetWhatsApp,
    updateProfile,
    updatePassword,
    submitProfileRequest,
    getPendingProfileRequest
};
